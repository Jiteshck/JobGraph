"""Neo4j Aura persistence and schema management for Job Skill Matcher."""
from __future__ import annotations

import os
import json
import uuid
from pathlib import Path
from typing import Any, Dict, Optional, List

from neo4j import GraphDatabase, Driver

_driver: Optional[Driver] = None
_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")


def init_database() -> Driver:
    """Create the driver, verify connectivity, and install idempotent constraints."""
    global _driver
    uri = os.getenv("NEO4J_URI", "").strip()
    username = os.getenv("NEO4J_USERNAME", "neo4j").strip()
    password = os.getenv("NEO4J_PASSWORD", "")
    if not uri or not password:
        raise RuntimeError(
            "Neo4j is not configured. Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD in .env."
        )
    if _driver is None:
        _driver = GraphDatabase.driver(uri, auth=(username, password))
    _driver.verify_connectivity()
    constraints = [
        "CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
        "CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE",
        "CREATE CONSTRAINT student_id_unique IF NOT EXISTS FOR (s:Student) REQUIRE s.id IS UNIQUE",
        "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
        "CREATE CONSTRAINT job_id_unique IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE",
        "CREATE CONSTRAINT company_id_unique IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE",
    ]
    with _driver.session(database=_DATABASE) as session:
        for statement in constraints:
            session.run(statement).consume()
        # Idempotently seed the original project skill taxonomy into Neo4j.
        # This is a catalogue seed, not per-user mock profile data.
        catalog_path = Path(__file__).parent / "data" / "skill_catalog.json"
        if catalog_path.exists():
            skills = json.loads(catalog_path.read_text(encoding="utf-8"))
            session.run(
                """
                UNWIND $skills AS item
                MERGE (sk:Skill {id: item.id})
                ON CREATE SET sk.name = item.name,
                              sk.category = item.category,
                              sk.description = item.description,
                              sk.marketDemand = item.marketDemand,
                              sk.neo4jColor = item.neo4jColor,
                              sk.createdAt = datetime()
                """,
                skills=skills,
            ).consume()
    return _driver


def get_driver() -> Driver:
    if _driver is None:
        raise RuntimeError("Neo4j driver is not initialized. Start the backend after configuring Neo4j Aura.")
    return _driver


def check_database() -> Dict[str, Any]:
    driver = get_driver()
    with driver.session(database=_DATABASE) as session:
        record = session.run("RETURN 1 AS ok, datetime() AS checkedAt").single()
        return {"connected": bool(record and record["ok"] == 1), "database": _DATABASE,
                "checkedAt": record["checkedAt"].iso_format() if record else None}


def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    query = """
    MATCH (u:User {email: $email})
    OPTIONAL MATCH (u)-[:HAS_PROFILE]->(s:Student)
    RETURN u { .* } AS user, s.id AS student_id
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(query, email=email.strip().lower()).single()
    if not record:
        return None
    user = dict(record["user"])
    user["student_id"] = record["student_id"]
    return user


def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Persist a User and, for student accounts, a unique linked Student profile."""
    query = """
    CREATE (u:User {
      id: $id, name: $name, email: $email, password_hash: $password_hash,
      role: $role, roll_no: $roll_no, provider: $provider, created_at: $created_at
    })
    FOREACH (_ IN CASE WHEN $role = 'student' THEN [1] ELSE [] END |
      CREATE (s:Student {
        id: $student_id, roll_no: $roll_no, location: '', preferred_location: '',
        bio: '', education: '', degree: '', experience_level: 'Fresher',
        target_role: '', semester: 0, cgpa: 0.0, created_at: $created_at
      })
      CREATE (u)-[:HAS_PROFILE]->(s)
    )
    RETURN u { .* } AS user
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(query, **{
            "id": user_data["id"], "name": user_data["name"], "email": user_data["email"],
            "password_hash": user_data.get("password_hash", ""), "role": user_data["role"],
            "roll_no": user_data.get("roll_no"), "provider": user_data.get("provider", "password"),
            "created_at": user_data["created_at"], "student_id": user_data.get("student_id")
        }).single()
    if not record:
        raise RuntimeError("Neo4j did not return the created user.")
    result = dict(record["user"])
    result["student_id"] = user_data.get("student_id")
    return result


def update_user(email: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    allowed = {key: value for key, value in update_data.items()
               if key in {"name", "password_hash", "roll_no", "provider"}}
    if not allowed:
        return find_user_by_email(email)
    query = """
    MATCH (u:User {email: $email})
    SET u += $updates
    RETURN u { .* } AS user
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(query, email=email.strip().lower(), updates=allowed).single()
    if not record:
        return None
    result = dict(record["user"])
    found = find_user_by_email(email)
    result["student_id"] = found.get("student_id") if found else None
    return result



def set_user_role(email: str, role: str) -> Optional[Dict[str, Any]]:
    """Set a user's role for controlled administrative provisioning only."""
    if role not in {"student", "admin"}:
        raise ValueError("Unsupported user role.")
    query = """
    MATCH (u:User {email: $email})
    SET u.role = $role
    RETURN u { .* } AS user
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(query, email=email.strip().lower(), role=role).single()
    if not record:
        return None
    result = dict(record["user"])
    found = find_user_by_email(email)
    result["student_id"] = found.get("student_id") if found else None
    return result


def close_database() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None


def get_student_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Return a student's own profile through the authenticated User->Student edge."""
    query = """
    MATCH (u:User {id: $user_id, role: 'student'})-[:HAS_PROFILE]->(s:Student)
    RETURN u { .id, .name, .email, .roll_no, .role } AS user,
           s { .* } AS student
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(query, user_id=user_id).single()
    if not record:
        return None
    user = dict(record["user"])
    student = dict(record["student"])
    return _profile_response(user, student)


def _profile_response(user: Dict[str, Any], student: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": student.get("id"),
        "userId": user.get("id"),
        "name": user.get("name") or "",
        "email": user.get("email") or "",
        "rollNo": student.get("roll_no") or user.get("roll_no") or "",
        "degree": student.get("degree") or student.get("education") or "",
        "semester": int(student.get("semester") or 0),
        "cgpa": float(student.get("cgpa") or 0),
        "targetRole": student.get("target_role") or "",
        "experienceLevel": student.get("experience_level") or "Fresher",
        "preferredLocation": student.get("preferred_location") or student.get("location") or "",
        "bio": student.get("bio") or "",
        "avatarColor": "#2563EB",
    }


def update_student_profile_by_user_id(user_id: str, updates: Dict[str, Any], skill_ids: List[str]) -> Dict[str, Any]:
    """Update profile and synchronize HAS_SKILL edges atomically for the authenticated student."""
    allowed = {
        "name": str(updates.get("name", "")).strip(),
        "degree": str(updates.get("degree", "")).strip(),
        "experience_level": str(updates.get("experienceLevel", "Fresher")).strip(),
        "preferred_location": str(updates.get("preferredLocation", "")).strip(),
        "target_role": str(updates.get("targetRole", "")).strip(),
        "bio": str(updates.get("bio", "")).strip(),
    }
    # Email is identity, not a profile-editable field. IDs are derived from the token.
    if not allowed["name"]:
        raise ValueError("Full name is required.")
    if not allowed["degree"]:
        raise ValueError("Education is required.")
    if not allowed["preferred_location"]:
        raise ValueError("Preferred location is required.")
    clean_ids = list(dict.fromkeys(str(skill_id) for skill_id in skill_ids))
    query = """
    MATCH (u:User {id: $user_id, role: 'student'})-[:HAS_PROFILE]->(s:Student)
    WITH u, s
    OPTIONAL MATCH (existing:Skill)
    WITH u, s, collect(existing.id) AS knownSkillIds
    WITH u, s, knownSkillIds,
         [sid IN $skill_ids WHERE sid IN knownSkillIds] AS validSkillIds
    WITH u, s, knownSkillIds, validSkillIds
    WHERE size(validSkillIds) = size($skill_ids)
    SET u.name = $name,
        s.degree = $degree,
        s.education = $degree,
        s.experience_level = $experience_level,
        s.preferred_location = $preferred_location,
        s.location = $preferred_location,
        s.target_role = $target_role,
        s.bio = $bio,
        s.updated_at = datetime()
    WITH u, s
    OPTIONAL MATCH (s)-[old:HAS_SKILL]->(oldSkill:Skill)
    WITH u, s, collect(
      CASE WHEN oldSkill IS NOT NULL AND NOT oldSkill.id IN $skill_ids THEN old ELSE null END
    ) AS oldRelationships
    FOREACH (rel IN [item IN oldRelationships WHERE item IS NOT NULL] | DELETE rel)
    WITH u, s
    UNWIND CASE WHEN size($skill_ids) = 0 THEN [null] ELSE $skill_ids END AS sid
    OPTIONAL MATCH (sk:Skill {id: sid})
    FOREACH (_ IN CASE WHEN sk IS NULL THEN [] ELSE [1] END |
      MERGE (s)-[rel:HAS_SKILL]->(sk)
      ON CREATE SET rel.proficiency = 'Intermediate',
                    rel.verified = false,
                    rel.acquiredDate = date()
      ON MATCH SET rel.proficiency = coalesce(rel.proficiency, 'Intermediate')
    )
    WITH u, s
    RETURN u { .id, .name, .email, .roll_no, .role } AS user,
           s { .* } AS student
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(
            query, user_id=user_id, skill_ids=clean_ids,
            name=allowed["name"], degree=allowed["degree"],
            experience_level=allowed["experience_level"],
            preferred_location=allowed["preferred_location"],
            target_role=allowed["target_role"], bio=allowed["bio"],
        ).single()
    if not record:
        # Distinguish missing profile from an invalid skill id.
        if not get_student_profile_by_user_id(user_id):
            raise LookupError("Student profile was not found for this account.")
        raise ValueError("One or more selected skills are invalid. Refresh the skill list and try again.")
    return _profile_response(dict(record["user"]), dict(record["student"]))


def list_skills() -> List[Dict[str, Any]]:
    query = """
    MATCH (sk:Skill)
    RETURN sk { .* } AS skill
    ORDER BY sk.category, sk.name
    """
    with get_driver().session(database=_DATABASE) as session:
        records = session.run(query).data()
    return [
        {
            "id": row["skill"].get("id"),
            "name": row["skill"].get("name") or "",
            "category": row["skill"].get("category") or "Core CS & Tools",
            "description": row["skill"].get("description") or "",
            "marketDemand": row["skill"].get("marketDemand") or "High",
            "neo4jColor": row["skill"].get("neo4jColor") or "#3B82F6",
        }
        for row in records
    ]


def get_student_skills_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    query = """
    MATCH (:User {id: $user_id, role: 'student'})-[:HAS_PROFILE]->(s:Student)
    MATCH (s)-[r:HAS_SKILL]->(sk:Skill)
    RETURN sk { .* } AS skill, r.proficiency AS proficiency,
           coalesce(r.verified, false) AS verified,
           toString(r.acquiredDate) AS acquiredDate
    ORDER BY sk.name
    """
    with get_driver().session(database=_DATABASE) as session:
        records = session.run(query, user_id=user_id).data()
    return [{
        "skill": {
            "id": row["skill"].get("id"), "name": row["skill"].get("name"),
            "category": row["skill"].get("category") or "Core CS & Tools",
            "description": row["skill"].get("description") or "",
            "marketDemand": row["skill"].get("marketDemand") or "High",
            "neo4jColor": row["skill"].get("neo4jColor") or "#3B82F6",
        },
        "proficiency": row["proficiency"] or "Intermediate",
        "verified": row["verified"],
        "acquiredDate": row["acquiredDate"] or "",
    } for row in records]


def sync_student_skills_by_user_id(user_id: str, skills: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    """Replace a student's HAS_SKILL edges, retaining proficiency from the submitted values."""
    normalized = []
    seen = set()
    for item in skills:
        skill_id = str(item.get("id", "")).strip()
        proficiency = str(item.get("proficiency", "Intermediate")).strip()
        if not skill_id or skill_id in seen:
            continue
        if proficiency not in {"Beginner", "Intermediate", "Advanced"}:
            raise ValueError("Skill proficiency must be Beginner, Intermediate, or Advanced.")
        seen.add(skill_id)
        normalized.append({"id": skill_id, "proficiency": proficiency})
    query = """
    MATCH (:User {id: $user_id, role: 'student'})-[:HAS_PROFILE]->(s:Student)
    OPTIONAL MATCH (catalog:Skill)
    WHERE catalog.id IN [item IN $skills | item.id]
    WITH s, collect(catalog.id) AS foundIds
    WHERE size(foundIds) = size($skills)
    OPTIONAL MATCH (s)-[old:HAS_SKILL]->(oldSkill:Skill)
    WITH s, collect(CASE WHEN oldSkill IS NOT NULL AND NOT oldSkill.id IN [item IN $skills | item.id] THEN old ELSE null END) AS candidates
    FOREACH (rel IN [item IN candidates WHERE item IS NOT NULL] | DELETE rel)
    WITH s
    UNWIND CASE WHEN size($skills) = 0 THEN [null] ELSE $skills END AS item
    OPTIONAL MATCH (sk:Skill {id: item.id})
    FOREACH (_ IN CASE WHEN sk IS NULL THEN [] ELSE [1] END |
      MERGE (s)-[rel:HAS_SKILL]->(sk)
      SET rel.proficiency = item.proficiency,
          rel.verified = coalesce(rel.verified, false),
          rel.acquiredDate = coalesce(rel.acquiredDate, date())
    )
    RETURN s.id AS studentId
    """
    with get_driver().session(database=_DATABASE) as session:
        record = session.run(query, user_id=user_id, skills=normalized).single()
    if not record:
        if not get_student_profile_by_user_id(user_id):
            raise LookupError("Student profile was not found for this account.")
        raise ValueError("One or more selected skills are invalid. Refresh the skill list and try again.")
    return get_student_skills_by_user_id(user_id)


# ---------------------------------------------------------------------------
# Job, company, and administrator catalogue persistence
# ---------------------------------------------------------------------------
def _driver_session():
    return get_driver().session(database=_DATABASE)

def list_companies() -> List[Dict[str, Any]]:
    q = """
    MATCH (c:Company)
    OPTIONAL MATCH (j:Job)-[:POSTED_BY]->(c)
    RETURN c { .* } AS company, count(CASE WHEN coalesce(j.status, 'published') = 'published' THEN j END) AS openingsCount
    ORDER BY company.name
    """
    with _driver_session() as session:
        rows = session.run(q).data()
    out=[]
    for row in rows:
        c=dict(row['company']); c['openingsCount']=row['openingsCount'] or 0
        out.append({ 'id':c.get('id'), 'name':c.get('name',''), 'industry':c.get('industry',''), 'location':c.get('location',''), 'website':c.get('website',''), 'openingsCount':c['openingsCount'] })
    return out

def save_company(data: Dict[str, Any], company_id: Optional[str] = None) -> Dict[str, Any]:
    name=str(data.get('name','')).strip()
    if not name: raise ValueError('Company name is required.')
    if not company_id:
        existing = next((c for c in list_companies() if c['name'].strip().casefold() == name.casefold()), None)
        if existing: raise ValueError('A company with this name already exists.')
    else:
        duplicate = next((c for c in list_companies() if c['id'] != company_id and c['name'].strip().casefold() == name.casefold()), None)
        if duplicate: raise ValueError('Another company already uses this name.')
    cid=company_id or str(data.get('id') or f"company-{uuid.uuid4()}")
    values={ 'id':cid, 'name':name, 'industry':str(data.get('industry','Information Technology')).strip(), 'location':str(data.get('location','')).strip(), 'website':str(data.get('website','')).strip() }
    q="""
    MERGE (c:Company {id:$id})
    SET c.name=$name, c.industry=$industry, c.location=$location, c.website=$website, c.updatedAt=datetime()
    RETURN c { .* } AS company
    """
    with _driver_session() as session: row=session.run(q, **values).single()
    return {**dict(row['company']), 'openingsCount': next((x['openingsCount'] for x in list_companies() if x['id']==cid),0)}

def delete_company(company_id: str) -> bool:
    q="""
    MATCH (c:Company {id:$id})
    OPTIONAL MATCH (j:Job)-[r:POSTED_BY]->(c)
    WITH c, collect(j) AS jobs, collect(r) AS rels
    FOREACH (r IN rels | DELETE r)
    FOREACH (j IN jobs | SET j.company = '')
    DETACH DELETE c
    RETURN count(c) AS deleted
    """
    with _driver_session() as session: row=session.run(q,id=company_id).single()
    return bool(row and row['deleted'])

def list_jobs() -> List[Dict[str, Any]]:
    q="""
    MATCH (j:Job)
    OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
    RETURN j { .* } AS job, c.name AS companyName
    ORDER BY coalesce(j.createdAt, datetime({year:2000,month:1,day:1})) DESC
    """
    with _driver_session() as session: rows=session.run(q).data()
    result=[]
    for row in rows:
        j=dict(row['job']); j['company']=row.get('companyName') or j.get('company','')
        result.append({ 'id':j.get('id'), 'title':j.get('title',''), 'company':j.get('company',''), 'experienceLevel':j.get('experienceLevel','Fresher'), 'department':j.get('department','Engineering'), 'description':j.get('description',''), 'minCgpa':j.get('minCgpa',0), 'location':j.get('location',''), 'salaryRange':j.get('salaryRange',''), 'jobType':j.get('jobType','Full Time'), 'status':j.get('status','published'), 'createdAt':str(j.get('createdAt','')) })
    return result

def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    return next((j for j in list_jobs() if j['id']==job_id), None)


def get_student_job_matches(student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Calculate and rank top published jobs using real Neo4j skill relationships."""
    query = """
    MATCH (s:Student {id: $student_id})
    OPTIONAL MATCH (s)-[has:HAS_SKILL]->(owned:Skill)
    WITH s, collect(CASE WHEN owned IS NULL THEN null ELSE {
      skill: owned { .* }, proficiency: coalesce(has.proficiency, 'Intermediate')
    } END) AS ownedSkills
    MATCH (j:Job)
    WHERE coalesce(j.status, 'published') = 'published'
    OPTIONAL MATCH (j)-[req:REQUIRES_SKILL]->(required:Skill)
    WITH s, ownedSkills, j,
         collect(CASE WHEN required IS NULL THEN null ELSE {
           skill: required { .* }, importance: coalesce(req.importance, 'MANDATORY'),
           minProficiency: coalesce(req.minProficiency, 'Intermediate')
         } END) AS requirements
    OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
    RETURN s.cgpa AS cgpa, j { .* } AS job, coalesce(c.name, j.company, '') AS companyName,
           ownedSkills, requirements
    ORDER BY coalesce(j.title, '')
    """
    with _driver_session() as session:
        rows = session.run(query, student_id=student_id).data()

    proficiency_rank = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    results: List[Dict[str, Any]] = []
    for row in rows:
        raw_job = dict(row.get("job") or {})
        required = [item for item in (row.get("requirements") or []) if item and item.get("skill")]
        if not required:
            continue
        owned = {}
        for item in (row.get("ownedSkills") or []):
            if item and item.get("skill"):
                owned[item["skill"].get("id")] = {
                    "skill": dict(item["skill"]),
                    "proficiency": item.get("proficiency") or "Intermediate",
                }

        matched_skills = []
        missing_skills = []
        weighted_matched = 0.0
        weighted_total = 0.0
        for requirement in required:
            raw_skill = dict(requirement["skill"])
            skill = {
                "id": raw_skill.get("id"), "name": raw_skill.get("name") or "",
                "category": raw_skill.get("category") or "Core CS & Tools",
                "description": raw_skill.get("description") or "",
                "marketDemand": raw_skill.get("marketDemand") or "High",
                "neo4jColor": raw_skill.get("neo4jColor") or "#3B82F6",
            }
            importance = requirement.get("importance") or "MANDATORY"
            min_prof = requirement.get("minProficiency") or "Intermediate"
            weight = 2.0 if importance == "MANDATORY" else 1.0
            weighted_total += weight
            held = owned.get(skill["id"])
            student_prof = held["proficiency"] if held else None
            satisfied = bool(held) and proficiency_rank.get(student_prof, 0) >= proficiency_rank.get(min_prof, 2)
            if satisfied:
                weighted_matched += weight
                matched_skills.append({
                    "skill": skill, "studentProficiency": student_prof,
                    "requiredImportance": importance, "minProficiency": min_prof,
                    "isSatisfied": True,
                })
            else:
                missing_skills.append({
                    "skill": skill, "requiredImportance": importance,
                    "minProficiency": min_prof, "priorityWeight": weight,
                })

        matched_count = len(matched_skills)
        total_count = len(required)
        # No-match jobs aren't recommendations; this keeps the list focused on useful matches.
        if matched_count == 0:
            continue
        match_percentage = round(matched_count / total_count * 100, 1)
        weighted_score = round(weighted_matched / weighted_total * 100, 1) if weighted_total else 0.0
        min_cgpa = float(raw_job.get("minCgpa") or 0)
        job = {
            "id": raw_job.get("id"), "title": raw_job.get("title") or "Untitled role",
            "company": row.get("companyName") or "", "experienceLevel": raw_job.get("experienceLevel") or "Fresher",
            "department": raw_job.get("department") or "Engineering", "description": raw_job.get("description") or "",
            "minCgpa": min_cgpa, "location": raw_job.get("location") or "",
            "salaryRange": raw_job.get("salaryRange") or "", "jobType": raw_job.get("jobType") or "Full Time",
        }
        results.append({
            "job": job, "matchPercentage": match_percentage, "weightedScore": weighted_score,
            "totalRequiredCount": total_count, "matchedCount": matched_count,
            "missingCount": len(missing_skills), "matchedSkills": matched_skills,
            "missingSkills": missing_skills, "cgpaEligible": float(row.get("cgpa") or 0) >= min_cgpa,
            "graphTraversalDepth": 2,
        })

    results.sort(key=lambda item: (item["matchPercentage"], item["weightedScore"], item["matchedCount"]), reverse=True)
    return results[:max(1, min(int(limit), 20))]



def save_job(data: Dict[str, Any], job_id: Optional[str] = None, required_skills: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    title=str(data.get('title','')).strip(); company_name=str(data.get('company','')).strip()
    if not title: raise ValueError('Job title is required.')
    jid=job_id or str(data.get('id') or f"job-{uuid.uuid4()}")
    if company_name:
        with _driver_session() as session:
            company_record = session.run("MATCH (c:Company) WHERE toLower(c.name)=toLower($name) RETURN c.id AS id LIMIT 1", name=company_name).single()
        if not company_record:
            save_company({'name': company_name, 'industry': 'Information Technology', 'location': str(data.get('location','')), 'website': ''})
    props={ 'id':jid, 'title':title, 'company':company_name, 'experienceLevel':data.get('experienceLevel','Fresher'), 'department':data.get('department','Engineering'), 'description':data.get('description',''), 'minCgpa':float(data.get('minCgpa') or 0), 'location':data.get('location',''), 'salaryRange':data.get('salaryRange',''), 'jobType':data.get('jobType','Full Time'), 'status':data.get('status','published') }
    q="""
    MERGE (j:Job {id:$id})
    SET j.title=$title, j.company=$company, j.experienceLevel=$experienceLevel,
        j.department=$department, j.description=$description, j.minCgpa=$minCgpa,
        j.location=$location, j.salaryRange=$salaryRange, j.jobType=$jobType,
        j.status=$status, j.updatedAt=datetime(), j.createdAt=coalesce(j.createdAt, datetime())
    WITH j
    OPTIONAL MATCH (j)-[old:POSTED_BY]->(:Company)
    DELETE old
    WITH j
    OPTIONAL MATCH (c:Company) WHERE toLower(c.name)=toLower($company)
    FOREACH (_ IN CASE WHEN c IS NULL THEN [] ELSE [1] END | MERGE (j)-[:POSTED_BY]->(c))
    RETURN j.id AS id
    """
    with _driver_session() as session: session.run(q, **props).consume()
    if required_skills is not None:
        clean=[]
        for item in required_skills:
            sid=str(item.get('skillId') or item.get('id') or '').strip()
            if sid: clean.append({'id':sid,'importance':item.get('importance','MANDATORY'),'minProficiency':item.get('minProficiency','Intermediate')})
        rq="""
        MATCH (j:Job {id:$id})
        OPTIONAL MATCH (j)-[old:REQUIRES_SKILL]->(:Skill)
        DELETE old
        WITH j
        UNWIND $skills AS item
        MATCH (sk:Skill {id:item.id})
        MERGE (j)-[r:REQUIRES_SKILL]->(sk)
        SET r.importance=item.importance, r.minProficiency=item.minProficiency
        RETURN count(r) AS linked
        """
        if clean:
            with _driver_session() as session: session.run(rq,id=jid,skills=clean).consume()
        else:
            with _driver_session() as session:
                session.run("MATCH (j:Job {id:$id})-[r:REQUIRES_SKILL]->() DELETE r",id=jid).consume()
    return get_job(jid) or props

def delete_job(job_id: str) -> bool:
    with _driver_session() as session:
        row=session.run("MATCH (j:Job {id:$id}) DETACH DELETE j RETURN count(*) AS deleted",id=job_id).single()
    return bool(row and row['deleted'])

def list_job_skills(job_id: str) -> List[Dict[str, Any]]:
    q="""
    MATCH (j:Job {id:$id})-[r:REQUIRES_SKILL]->(sk:Skill)
    RETURN sk { .* } AS skill, r.importance AS importance, r.minProficiency AS minProficiency
    ORDER BY sk.name
    """
    with _driver_session() as session: rows=session.run(q,id=job_id).data()
    return [{ 'skill': { 'id':r['skill'].get('id'), 'name':r['skill'].get('name',''), 'category':r['skill'].get('category','Core CS & Tools'), 'description':r['skill'].get('description',''), 'marketDemand':r['skill'].get('marketDemand','High'), 'neo4jColor':r['skill'].get('neo4jColor','#3B82F6') }, 'importance':r.get('importance') or 'MANDATORY', 'minProficiency':r.get('minProficiency') or 'Intermediate' } for r in rows]

def save_skill(data: Dict[str, Any], skill_id: Optional[str] = None) -> Dict[str, Any]:
    name=str(data.get('name','')).strip()
    if not name: raise ValueError('Skill name is required.')
    existing_skills = list_skills()
    if not skill_id and any(x['name'].strip().casefold() == name.casefold() for x in existing_skills):
        raise ValueError('A skill with this name already exists.')
    if skill_id and any(x['id'] != skill_id and x['name'].strip().casefold() == name.casefold() for x in existing_skills):
        raise ValueError('Another skill already uses this name.')
    sid=skill_id or str(data.get('id') or f"skill-{uuid.uuid4()}")
    q="""
    MERGE (sk:Skill {id:$id})
    SET sk.name=$name, sk.category=$category, sk.description=$description,
        sk.marketDemand=$marketDemand, sk.neo4jColor=$neo4jColor, sk.updatedAt=datetime()
    RETURN sk { .* } AS skill
    """
    values={'id':sid,'name':name,'category':data.get('category','Core CS & Tools'),'description':data.get('description',''),'marketDemand':data.get('marketDemand','High'),'neo4jColor':data.get('neo4jColor','#3B82F6')}
    with _driver_session() as session: row=session.run(q,**values).single()
    return dict(row['skill'])

def delete_skill(skill_id: str) -> bool:
    with _driver_session() as session:
        row=session.run("MATCH (sk:Skill {id:$id}) DETACH DELETE sk RETURN count(*) AS deleted",id=skill_id).single()
    return bool(row and row['deleted'])

def admin_students() -> List[Dict[str, Any]]:
    q="""
    MATCH (u:User)-[:HAS_PROFILE]->(s:Student)
    WHERE u.role='student'
    OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)
    RETURN u { .id, .name, .email, .roll_no } AS user, s { .* } AS student,
           collect(sk { .id, .name, .category, .description, .marketDemand, .neo4jColor }) AS skills
    ORDER BY user.name
    """
    with _driver_session() as session: rows=session.run(q).data()
    out=[]
    for r in rows:
        u=dict(r['user']); s=dict(r['student']); out.append({'id':s.get('id'), 'name':u.get('name',''), 'email':u.get('email',''), 'rollNo':u.get('roll_no',''), 'degree':s.get('degree',''), 'semester':s.get('semester',1), 'cgpa':s.get('cgpa',0), 'targetRole':s.get('targetRole',''), 'experienceLevel':s.get('experienceLevel','Fresher'), 'preferredLocation':s.get('preferredLocation',''), 'skills':[x for x in r['skills'] if x and x.get('id')]})
    return out


def update_admin_student(student_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    allowed_map = {
        'degree': 'degree', 'semester': 'semester', 'cgpa': 'cgpa',
        'targetRole': 'targetRole', 'experienceLevel': 'experienceLevel',
        'preferredLocation': 'preferredLocation', 'bio': 'bio'
    }
    updates = {prop: data[key] for key, prop in allowed_map.items() if key in data}
    q = """
    MATCH (u:User)-[:HAS_PROFILE]->(s:Student {id:$id})
    WHERE u.role='student'
    SET s += $updates
    FOREACH (_ IN CASE WHEN $name IS NULL THEN [] ELSE [1] END | SET u.name=$name)
    RETURN u { .id, .name, .email, .roll_no } AS user, s { .* } AS student
    """
    with _driver_session() as session:
        row=session.run(q,id=student_id,updates=updates,name=data.get('name')).single()
    if not row: return None
    u=dict(row['user']); st=dict(row['student'])
    return {'id':st.get('id'),'name':u.get('name',''),'email':u.get('email',''),'rollNo':u.get('roll_no',''),'degree':st.get('degree',''),'semester':st.get('semester',1),'cgpa':st.get('cgpa',0),'targetRole':st.get('targetRole',''),'experienceLevel':st.get('experienceLevel','Fresher'),'preferredLocation':st.get('preferredLocation','')}

def delete_admin_student(student_id: str) -> bool:
    q="""
    MATCH (u:User)-[:HAS_PROFILE]->(s:Student {id:$id})
    WHERE u.role='student'
    DETACH DELETE s, u
    RETURN count(*) AS deleted
    """
    with _driver_session() as session: row=session.run(q,id=student_id).single()
    return bool(row and row['deleted'])

def replace_admin_student_skills(student_id: str, skill_ids: List[str]) -> None:
    clean=list(dict.fromkeys(str(x).strip() for x in skill_ids if str(x).strip()))
    q="""
    MATCH (s:Student {id:$id})
    OPTIONAL MATCH (s)-[old:HAS_SKILL]->(:Skill)
    DELETE old
    WITH s
    UNWIND $ids AS sid
    MATCH (sk:Skill {id:sid})
    MERGE (s)-[r:HAS_SKILL]->(sk)
    SET r.proficiency='Intermediate', r.verified=false, r.acquiredDate=date()
    RETURN count(r) AS linked
    """
    with _driver_session() as session:
        if clean: session.run(q,id=student_id,ids=clean).consume()
        else: session.run("MATCH (s:Student {id:$id}) OPTIONAL MATCH (s)-[r:HAS_SKILL]->() DELETE r",id=student_id).consume()
