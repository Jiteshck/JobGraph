"""
JobGraph Authentication Backend Server
======================================
Provides user registration, login, JWT token issuance, role-based access
(Student vs Administrator), and Google OAuth endpoints.

Usage:
    pip install -r requirements.txt
    python server.py

Database Connectivity:
    Hooks are provided in the 'DATABASE CONNECTIVITY HOOKS' section below.
    Fill your database driver and connection logic (e.g. Neo4j, PostgreSQL,
    MongoDB, SQLite) when you are ready.
"""

import os
import sys
import json
import time
import uuid
import hmac
import hashlib
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

# ============================================================================
# ENVIRONMENT CONFIGURATION & .env LOADER
# ============================================================================
def load_env_file(filepath: str = ".env") -> None:
    """Lightweight .env loader that works without third-party dependencies."""
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = val
    except Exception as e:
        print(f"[Warning] Could not parse {filepath}: {e}")

load_env_file(".env")

# Use certifi's maintained public CA bundle for Neo4j TLS on Windows and other platforms.
# This preserves certificate verification; it does not trust arbitrary/self-signed certificates.
try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
except ImportError:
    pass

PORT = int(os.environ.get("PORT", "8000"))
HOST = os.environ.get("HOST", "0.0.0.0")
SECRET_KEY = os.environ.get("SECRET_KEY", "jobgraph-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
NEO4J_URI = os.environ.get("NEO4J_URI", "")
NEO4J_USERNAME = os.environ.get("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "")
NEO4J_DATABASE = os.environ.get("NEO4J_DATABASE", "neo4j")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
ADMIN_EMAILS = [
    email.strip().lower()
    for email in os.environ.get("ADMIN_EMAILS", "admin@jobgraph.edu,placement.admin@jobgraph.edu").split(",")
    if email.strip()
]
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

# ============================================================================
# PASSWORD HASHING & JWT UTILITIES (Zero External Dependencies)
# ============================================================================
def hash_password(password: str) -> str:
    """Generate salted PBKDF2-HMAC-SHA256 password hash."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return base64.b64encode(salt + key).decode("ascii")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against salted PBKDF2 hash."""
    try:
        decoded = base64.b64decode(hashed_password.encode("ascii"))
        salt = decoded[:16]
        key = decoded[16:]
        new_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(key, new_key)
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def _b64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding and padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("ascii"))

def create_jwt_token(payload: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates standard HS256 JWT token."""
    to_encode = payload.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp()), "iat": int(datetime.utcnow().timestamp())})
    header = {"alg": "HS256", "typ": "JWT"}
    
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(to_encode, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates HS256 JWT signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if "exp" in payload and datetime.utcnow().timestamp() > payload["exp"]:
            return None
        return payload
    except Exception:
        return None

# ============================================================================
# NEO4J DATABASE ADAPTER
# ============================================================================
from database import (
    init_database, get_driver, check_database, find_user_by_email, create_user,
    update_user, set_user_role, close_database, get_student_profile_by_user_id,
    update_student_profile_by_user_id, list_skills, get_student_skills_by_user_id, sync_student_skills_by_user_id,
    list_companies, save_company, delete_company, list_jobs, get_job, save_job, delete_job,
    list_job_skills, save_skill, delete_skill, admin_students, update_admin_student, delete_admin_student, replace_admin_student_skills, get_student_job_matches
)


def db_init_connection():
    """Connect to Neo4j Aura and install required uniqueness constraints."""
    driver = init_database()
    print(f"[Database] Neo4j connected; database={NEO4J_DATABASE}")
    return driver


def db_find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return find_user_by_email(email)


def db_create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    return create_user(user_data)


def db_update_user(email: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    return update_user(email, update_data)


# ============================================================================
# HTTP SERVER IMPLEMENTATION (FastAPI if installed, Standard Library Fallback)
# ============================================================================
def create_fastapi_app():
    """Create FastAPI application if fastapi & uvicorn are available."""
    try:
        from fastapi import FastAPI, HTTPException, Header, Depends, Body
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel, EmailStr
    except ImportError:
        return None

    app = FastAPI(
        title="JobGraph Authentication API",
        description="Backend API for student/admin authentication and graph-based career matching.",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if "*" in CORS_ORIGINS else CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from pydantic import Field

    class LoginRequest(BaseModel):
        email: EmailStr
        password: str = Field(min_length=1, max_length=256)

    class SignupRequest(BaseModel):
        name: str = Field(min_length=2, max_length=100)
        email: EmailStr
        password: str = Field(min_length=8, max_length=128)
        rollNo: Optional[str] = Field(default=None, max_length=50)

    class StudentProfileUpdate(BaseModel):
        name: str = Field(min_length=2, max_length=100)
        degree: str = Field(min_length=1, max_length=120)
        experienceLevel: str = Field(default="Fresher", max_length=40)
        preferredLocation: str = Field(min_length=1, max_length=120)
        targetRole: str = Field(default="", max_length=120)
        bio: str = Field(default="", max_length=2000)
        skillIds: list[str] = Field(default_factory=list, max_length=100)

    class StudentSkillUpdate(BaseModel):
        id: str = Field(min_length=1, max_length=100)
        proficiency: str = Field(default="Intermediate", pattern="^(Beginner|Intermediate|Advanced)$")

    class StudentSkillsUpdate(BaseModel):
        skills: list[StudentSkillUpdate] = Field(max_length=100)

    @app.get("/api/health")
    def health_check():
        try:
            db_status = check_database()
            return {"status": "ok", "service": "JobGraph API", "database": db_status, "timestamp": int(time.time())}
        except Exception as exc:
            raise HTTPException(status_code=503, detail={"status": "unavailable", "database": "disconnected", "message": str(exc)})

    @app.post("/api/auth/signup")
    def signup_endpoint(req: SignupRequest):
        clean_email = req.email.strip().lower()
        clean_name = req.name.strip()
        if len(clean_name) < 2:
            raise HTTPException(status_code=422, detail="Name must contain at least 2 characters.")
        if db_find_user_by_email(clean_email):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        # Public signup can never assign administrator privileges.
        role = "student"
        user_id = f"user-{uuid.uuid4()}"
        user_record = {
            "id": user_id,
            "name": clean_name,
            "email": clean_email,
            "password_hash": hash_password(req.password),
            "role": role,
            "student_id": f"student-{user_id}",
            "roll_no": req.rollNo.strip() if req.rollNo else f"BCA-{datetime.now().year}-{user_id[-3:]}",
            "provider": "password",
            "created_at": datetime.utcnow().isoformat()
        }
        try:
            db_create_user(user_record)
        except Exception as exc:
            # A unique email constraint also protects against simultaneous signups.
            from neo4j.exceptions import ConstraintError
            if isinstance(exc, ConstraintError):
                raise HTTPException(status_code=409, detail="An account with this email already exists.")
            raise

        token = create_jwt_token({
            "sub": user_record["id"],
            "email": clean_email,
            "role": role,
            "name": user_record["name"]
        })
        
        safe_user = {k: v for k, v in user_record.items() if k != "password_hash"}
        return {"success": True, "user": safe_user, "token": token}

    @app.post("/api/auth/login")
    def login_endpoint(req: LoginRequest):
        clean_email = req.email.strip().lower()
        user = db_find_user_by_email(clean_email)
        if not user or not verify_password(req.password, user.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        
        token = create_jwt_token({
            "sub": user["id"],
            "email": clean_email,
            "role": user["role"],
            "name": user["name"]
        })
        
        safe_user = {k: v for k, v in user.items() if k != "password_hash"}
        return {"success": True, "user": safe_user, "token": token}

    @app.post("/api/auth/google")
    def google_auth_endpoint():
        # Do not accept client-supplied email/name as proof of identity.
        raise HTTPException(status_code=501, detail="Google sign-in is not configured. Use email and password.")

    @app.get("/api/auth/me")
    def get_current_user(authorization: Optional[str] = Header(None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
        token = authorization.split(" ")[1]
        payload = decode_jwt_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Token expired or invalid.")
        user = db_find_user_by_email(payload.get("email", ""))
        if not user or user.get("id") != payload.get("sub"):
            raise HTTPException(status_code=401, detail="Session is invalid or the account no longer exists.")
        safe_user = {k: v for k, v in user.items() if k != "password_hash"}
        return {"success": True, "user": safe_user}


    def authenticated_user(authorization: Optional[str]) -> Dict[str, Any]:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
        payload = decode_jwt_token(authorization.split(" ", 1)[1])
        if not payload:
            raise HTTPException(status_code=401, detail="Token expired or invalid.")
        user = db_find_user_by_email(payload.get("email", ""))
        if not user or user.get("id") != payload.get("sub"):
            raise HTTPException(status_code=401, detail="Session is invalid or the account no longer exists.")
        return user

    @app.get("/api/skills")
    def skills_catalog():
        return {"success": True, "skills": list_skills()}

    @app.get("/api/students/me")
    def get_my_student_profile(authorization: Optional[str] = Header(None)):
        user = authenticated_user(authorization)
        if user.get("role") != "student":
            raise HTTPException(status_code=403, detail="Student access required.")
        profile = get_student_profile_by_user_id(user["id"])
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found.")
        profile["skills"] = get_student_skills_by_user_id(user["id"])
        return {"success": True, "profile": profile}

    @app.put("/api/students/me/skills")
    def save_my_student_skills(req: StudentSkillsUpdate, authorization: Optional[str] = Header(None)):
        user = authenticated_user(authorization)
        if user.get("role") != "student":
            raise HTTPException(status_code=403, detail="Student access required.")
        try:
            skills = sync_student_skills_by_user_id(
                user["id"], [item.model_dump() for item in req.skills]
            )
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))
        return {"success": True, "skills": skills}

    @app.put("/api/students/me")
    def save_my_student_profile(req: StudentProfileUpdate, authorization: Optional[str] = Header(None)):
        user = authenticated_user(authorization)
        if user.get("role") != "student":
            raise HTTPException(status_code=403, detail="Student access required.")
        try:
            profile = update_student_profile_by_user_id(
                user["id"],
                req.model_dump(exclude={"skillIds"}),
                req.skillIds,
            )
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))
        profile["skills"] = get_student_skills_by_user_id(user["id"])
        return {"success": True, "profile": profile}

    def require_admin(authorization: Optional[str]) -> Dict[str, Any]:
        user = authenticated_user(authorization)
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Administrator access required.")
        return user

    @app.get("/api/jobs")
    def public_jobs():
        return {"success": True, "jobs": [j for j in list_jobs() if j.get("status", "published") == "published"]}

    @app.get("/api/jobs/{job_id}")
    def public_job_detail(job_id: str):
        job = get_job(job_id)
        if not job or job.get("status", "published") != "published":
            raise HTTPException(status_code=404, detail="Job not found.")
        return {"success": True, "job": job, "requiredSkills": list_job_skills(job_id)}

    @app.get("/api/students/{student_id}/matches")
    def get_job_matches_for_student(student_id: str, authorization: Optional[str] = Header(None)):
        user = authenticated_user(authorization)
        if user.get("role") == "student":
            own_profile = get_student_profile_by_user_id(user["id"])
            if not own_profile or own_profile.get("id") != student_id:
                raise HTTPException(status_code=403, detail="Students can only view their own recommendations.")
        elif user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access denied.")
        try:
            matches = get_student_job_matches(student_id, limit=5)
        except Exception as exc:
            print(f"[Recommendations] Neo4j match calculation failed: {exc}")
            raise HTTPException(status_code=500, detail="Could not calculate recommendations from the graph database.")
        return {"success": True, "matches": matches, "limit": 5, "source": "neo4j-cypher"}

    @app.get("/api/companies")
    def public_companies():
        return {"success": True, "companies": list_companies()}

    @app.get("/api/admin/students")
    def get_admin_students(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        return {"success": True, "students": admin_students()}

    @app.post("/api/admin/students")
    def create_admin_student(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        raise HTTPException(status_code=409, detail="Students must create their own account through signup so they can set a private password. Use the student tab to manage existing accounts.")

    @app.put("/api/admin/students/{student_id}")
    def update_admin_student_endpoint(student_id: str, payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try:
            student = update_admin_student(student_id, payload)
            if not student: raise HTTPException(status_code=404, detail="Student not found.")
            if "selectedSkills" in payload: replace_admin_student_skills(student_id, payload.get("selectedSkills") or [])
            return {"success": True, "student": student}
        except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc))

    @app.delete("/api/admin/students/{student_id}")
    def remove_admin_student(student_id: str, authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        if not delete_admin_student(student_id): raise HTTPException(status_code=404, detail="Student not found.")
        return {"success": True}

    @app.get("/api/admin/jobs")
    def get_admin_jobs(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        return {"success": True, "jobs": list_jobs()}

    @app.post("/api/admin/jobs")
    def create_admin_job(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try:
            job = save_job(payload, required_skills=payload.get("requiredSkills", []))
            return {"success": True, "job": job}
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    @app.put("/api/admin/jobs/{job_id}")
    def update_admin_job(job_id: str, payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try:
            job = save_job(payload, job_id=job_id, required_skills=payload.get("requiredSkills") if "requiredSkills" in payload else None)
            return {"success": True, "job": job}
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    @app.delete("/api/admin/jobs/{job_id}")
    def remove_admin_job(job_id: str, authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        if not delete_job(job_id): raise HTTPException(status_code=404, detail="Job not found.")
        return {"success": True}

    @app.get("/api/admin/companies")
    def get_admin_companies(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        return {"success": True, "companies": list_companies()}

    @app.post("/api/admin/companies")
    def create_admin_company(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try: return {"success": True, "company": save_company(payload)}
        except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc))

    @app.put("/api/admin/companies/{company_id}")
    def update_admin_company(company_id: str, payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try: return {"success": True, "company": save_company(payload, company_id=company_id)}
        except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc))

    @app.delete("/api/admin/companies/{company_id}")
    def remove_admin_company(company_id: str, authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        if not delete_company(company_id): raise HTTPException(status_code=404, detail="Company not found.")
        return {"success": True}

    @app.get("/api/admin/skills")
    def get_admin_skills(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        return {"success": True, "skills": list_skills()}

    @app.post("/api/admin/skills")
    def create_admin_skill(payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try: return {"success": True, "skill": save_skill(payload)}
        except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc))

    @app.put("/api/admin/skills/{skill_id}")
    def update_admin_skill(skill_id: str, payload: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        try: return {"success": True, "skill": save_skill(payload, skill_id=skill_id)}
        except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc))

    @app.delete("/api/admin/skills/{skill_id}")
    def remove_admin_skill(skill_id: str, authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        if not delete_skill(skill_id): raise HTTPException(status_code=404, detail="Skill not found.")
        return {"success": True}

    @app.get("/api/admin/job-skills-map")
    def get_job_skill_map(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        return {"success": True, "items": {j["id"]: [x["skill"] for x in list_job_skills(j["id"])] for j in list_jobs()}}

    @app.get("/api/admin/student-skills-map")
    def get_student_skill_map(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        return {"success": True, "items": {s["id"]: s["skills"] for s in admin_students()}}

    @app.get("/api/admin/stats")
    def admin_stats(authorization: Optional[str] = Header(None)):
        require_admin(authorization)
        students, jobs, companies, skills = admin_students(), list_jobs(), list_companies(), list_skills()
        with get_driver().session(database=NEO4J_DATABASE) as session:
            demanded = session.run("MATCH (:Job)-[:REQUIRES_SKILL]->(sk:Skill) RETURN sk { .id, .name, .category, .description, .marketDemand, .neo4jColor } AS skill, count(*) AS count ORDER BY count DESC LIMIT 5").data()
        top_demanded = [{"skill": row["skill"], "count": row["count"]} for row in demanded]
        return {"success": True, "stats": {"totalStudents": len(students), "totalJobs": len(jobs), "totalCompanies": len(companies), "totalSkills": len(skills), "totalStudentSkillEdges": sum(len(x.get("skills", [])) for x in students), "totalJobSkillEdges": sum(len(list_job_skills(j["id"])) for j in jobs), "avgTopMatchPercentage": 0, "topDemandedSkills": top_demanded}}

    return app

# ============================================================================
# STANDALONE STANDARD LIBRARY HTTP SERVER (Runs anywhere without pip dependencies)
# ============================================================================
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

class StandaloneAuthHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin if origin in CORS_ORIGINS or "*" in CORS_ORIGINS else "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Credentials", "true")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, status_code: int, data: Dict[str, Any]):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _read_body_json(self) -> Optional[Dict[str, Any]]:
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                return {}
            raw = self.rfile.read(content_length)
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return None

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        if path == "/api/health":
            try:
                self._send_json(200, {"status": "ok", "service": "JobGraph API", "database": check_database(), "timestamp": int(time.time())})
            except Exception as exc:
                self._send_json(503, {"status": "unavailable", "database": "disconnected", "message": str(exc)})
            return

        if path == "/api/auth/me":
            auth_header = self.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                self._send_json(401, {"success": False, "error": "Missing Bearer token"})
                return
            token = auth_header.split(" ")[1]
            payload = decode_jwt_token(token)
            if not payload:
                self._send_json(401, {"success": False, "error": "Invalid or expired token"})
                return
            user = db_find_user_by_email(payload.get("email", ""))
            if not user or user.get("id") != payload.get("sub"):
                self._send_json(401, {"success": False, "error": "Session is invalid or the account no longer exists"})
                return
            safe_user = {k: v for k, v in user.items() if k != "password_hash"}
            self._send_json(200, {"success": True, "user": safe_user})
            return

        self._send_json(404, {"error": "Not Found"})

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        body = self._read_body_json()

        if body is None:
            self._send_json(400, {"success": False, "error": "Invalid JSON body"})
            return

        # 1. Signup Endpoint: All new registrations are Students
        if path == "/api/auth/signup":
            email = (body.get("email") or "").strip().lower()
            name = (body.get("name") or "").strip()
            password = body.get("password") or ""
            roll_no = body.get("rollNo") or body.get("roll_no") or ""

            if not email or not password or not name:
                self._send_json(400, {"success": False, "error": "Name, email, and password are required"})
                return
            if len(name) < 2 or len(name) > 100:
                self._send_json(400, {"success": False, "error": "Name must be between 2 and 100 characters"})
                return
            if len(password) < 8 or len(password) > 128:
                self._send_json(400, {"success": False, "error": "Password must be between 8 and 128 characters"})
                return

            if db_find_user_by_email(email):
                self._send_json(409, {"success": False, "error": "An account with this email already exists"})
                return

            role = "student"
            user_id = f"user-{uuid.uuid4()}"
            user_record = {
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": hash_password(password),
                "role": role,
                "student_id": f"student-{user_id}",
                "roll_no": roll_no or f"BCA-{datetime.now().year}-{user_id[-3:]}",
                "provider": "password",
                "created_at": datetime.utcnow().isoformat()
            }
            db_create_user(user_record)

            token = create_jwt_token({
                "sub": user_record["id"],
                "email": email,
                "role": role,
                "name": name
            })
            safe_user = {k: v for k, v in user_record.items() if k != "password_hash"}
            self._send_json(201, {"success": True, "user": safe_user, "token": token})
            return

        # 2. Login Endpoint
        if path == "/api/auth/login":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not email or not password:
                self._send_json(400, {"success": False, "error": "Email and password are required"})
                return

            user = db_find_user_by_email(email)
            if not user or not verify_password(password, user.get("password_hash", "")):
                self._send_json(401, {"success": False, "error": "Invalid email or password"})
                return

            token = create_jwt_token({
                "sub": user["id"],
                "email": email,
                "role": user["role"],
                "name": user["name"]
            })
            safe_user = {k: v for k, v in user.items() if k != "password_hash"}
            self._send_json(200, {"success": True, "user": safe_user, "token": token})
            return

        # Google login is deliberately disabled until server-side ID-token verification is configured.
        if path == "/api/auth/google":
            self._send_json(501, {"success": False, "error": "Google sign-in is not configured. Use email and password."})
            return

        self._send_json(404, {"error": "Not Found"})

# ============================================================================
# ENTRY POINT
# ============================================================================
def main():
    print("=" * 65)
    print(" JobGraph Authentication Backend Server")
    print(f" Port: {PORT} | Host: {HOST}")
    print(f" CORS Origins: {', '.join(CORS_ORIGINS)}")
    print("=" * 65)
    
    db_init_connection()

    # Try FastAPI / Uvicorn if available
    try:
        import uvicorn
        fastapi_app = create_fastapi_app()
        if fastapi_app is not None:
            print("[Server] Starting with high-performance FastAPI/Uvicorn engine...")
            uvicorn.run(fastapi_app, host=HOST, port=PORT)
            return
    except ImportError:
        pass

    # Standard library fallback (zero pip dependencies required)
    print("[Server] Starting with standard library HTTP server...")
    print(f"[Server] Ready at http://{HOST}:{PORT}")
    server = HTTPServer((HOST, PORT), StandaloneAuthHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down gracefully.")
        server.server_close()

if __name__ == "__main__":
    main()
