import {
  StudentNode,
  SkillNode,
  JobNode,
  CompanyNode,
  StudentSkillRel,
  JobSkillRel,
  SkillSynergyRel,
  CypherQueryTemplate
} from '../types/graph';

export const INITIAL_COMPANIES: CompanyNode[] = [
  {
    id: 'comp-abc',
    name: 'ABC Technologies',
    industry: 'Enterprise Software & Cloud Platforms',
    location: 'Pune',
    website: 'https://abctechnologies.example',
    openingsCount: 3
  },
  {
    id: 'comp-technova',
    name: 'TechNova',
    industry: 'Cloud Infrastructure & Microservices',
    location: 'Bangalore',
    website: 'https://technova.example',
    openingsCount: 2
  },
  {
    id: 'comp-codesphere',
    name: 'CodeSphere',
    industry: 'Scalable Systems & Distributed Software',
    location: 'Mumbai',
    website: 'https://codesphere.example',
    openingsCount: 2
  },
  {
    id: 'comp-dataworks',
    name: 'DataWorks',
    industry: 'Data Engineering & Graph Analytics',
    location: 'Hyderabad',
    website: 'https://dataworks.example',
    openingsCount: 2
  }
];

export const INITIAL_STUDENTS: StudentNode[] = [
  {
    id: 'student-1',
    name: 'Jitesh Choudhary',
    rollNo: 'BCA-2024-001',
    degree: 'BCA',
    semester: 6,
    cgpa: 8.4,
    targetRole: 'Backend Developer',
    email: 'jiteshchoudhary193@gmail.com',
    avatarColor: '#2563EB',
    experienceLevel: 'Fresher',
    preferredLocation: 'Pune'
  },
  {
    id: 'student-2',
    name: 'Priya Verma',
    rollNo: 'BCA-2024-089',
    degree: 'BCA',
    semester: 6,
    cgpa: 8.9,
    targetRole: 'Backend Developer',
    email: 'priya.bca24@college.edu',
    avatarColor: '#7C3AED',
    experienceLevel: 'Fresher',
    preferredLocation: 'Bangalore'
  },
  {
    id: 'student-3',
    name: 'Aman Patel',
    rollNo: 'BCA-2025-015',
    degree: 'BCA',
    semester: 4,
    cgpa: 7.8,
    targetRole: 'Software Engineer',
    email: 'aman.bca25@college.edu',
    avatarColor: '#059669',
    experienceLevel: 'Fresher',
    preferredLocation: 'Mumbai'
  },
  {
    id: 'student-4',
    name: 'Sneha Roy',
    rollNo: 'BCA-2024-112',
    degree: 'BCA',
    semester: 6,
    cgpa: 8.6,
    targetRole: 'Python Developer',
    email: 'sneha.bca24@college.edu',
    avatarColor: '#D97706',
    experienceLevel: 'Fresher',
    preferredLocation: 'Delhi'
  }
];

export const ALL_SKILLS: SkillNode[] = [
  // Languages
  {
    id: 'skill-java',
    name: 'Java',
    category: 'Languages',
    description: 'Object-oriented programming, JVM ecosystem, multithreading, and enterprise backend engineering.',
    marketDemand: 'Very High',
    neo4jColor: '#E11D48' // rose
  },
  {
    id: 'skill-js',
    name: 'JavaScript (ES6+)',
    category: 'Languages',
    description: 'Modern asynchronous JavaScript, closures, event loop, and DOM manipulation.',
    marketDemand: 'Very High',
    neo4jColor: '#F59E0B' // amber
  },
  {
    id: 'skill-ts',
    name: 'TypeScript',
    category: 'Languages',
    description: 'Typed superset of JavaScript providing static typing, generics, and interfaces.',
    marketDemand: 'Very High',
    neo4jColor: '#3B82F6' // blue
  },
  {
    id: 'skill-py',
    name: 'Python',
    category: 'Languages',
    description: 'High-level interpreted language used for automation, scripting, and backend APIs.',
    marketDemand: 'Very High',
    neo4jColor: '#10B981' // emerald
  },
  {
    id: 'skill-sql',
    name: 'SQL',
    category: 'Database',
    description: 'Structured Query Language for querying and managing relational DBMS tables.',
    marketDemand: 'High',
    neo4jColor: '#6366F1' // indigo
  },

  // Frontend
  {
    id: 'skill-react',
    name: 'React',
    category: 'Frontend',
    description: 'Declarative component-driven frontend library with hooks, context, and virtual DOM.',
    marketDemand: 'Very High',
    neo4jColor: '#06B6D4' // cyan
  },
  {
    id: 'skill-html-css',
    name: 'HTML5 & CSS3',
    category: 'Frontend',
    description: 'Semantic document structure, CSS flexbox, grid, and responsive styling principles.',
    marketDemand: 'High',
    neo4jColor: '#EC4899' // pink
  },
  {
    id: 'skill-tailwind',
    name: 'Tailwind CSS',
    category: 'Frontend',
    description: 'Utility-first CSS framework for rapid and maintainable user interface composition.',
    marketDemand: 'High',
    neo4jColor: '#0EA5E9' // sky
  },

  // Backend
  {
    id: 'skill-node',
    name: 'Node.js',
    category: 'Backend',
    description: 'Event-driven, non-blocking asynchronous JavaScript server-side runtime.',
    marketDemand: 'Very High',
    neo4jColor: '#22C55E' // green
  },
  {
    id: 'skill-express',
    name: 'Express.js',
    category: 'Backend',
    description: 'Minimalist web framework for Node.js handling REST API routes and middlewares.',
    marketDemand: 'Very High',
    neo4jColor: '#64748B' // slate
  },
  {
    id: 'skill-rest',
    name: 'RESTful API Design',
    category: 'Backend',
    description: 'Stateless HTTP API architecture, JSON payload formatting, status codes, and security.',
    marketDemand: 'High',
    neo4jColor: '#8B5CF6' // purple
  },

  // Database / NoSQL
  {
    id: 'skill-neo4j',
    name: 'Neo4j & Cypher',
    category: 'Database',
    description: 'Native graph database engine and Cypher declarative graph query language for interconnected data.',
    marketDemand: 'High',
    neo4jColor: '#0284C7' // deep sky
  },
  {
    id: 'skill-mongo',
    name: 'MongoDB',
    category: 'Database',
    description: 'Document-oriented NoSQL database storing flexible BSON schemas.',
    marketDemand: 'High',
    neo4jColor: '#16A34A' // green
  },
  {
    id: 'skill-postgres',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Advanced open-source relational database with ACID compliance and JSONB support.',
    marketDemand: 'High',
    neo4jColor: '#2563EB' // blue
  },
  {
    id: 'skill-redis',
    name: 'Redis',
    category: 'Database',
    description: 'In-memory key-value data structure store used as a fast cache and message broker.',
    marketDemand: 'High',
    neo4jColor: '#EF4444' // red
  },

  // Cloud & DevOps
  {
    id: 'skill-docker',
    name: 'Docker',
    category: 'Cloud & DevOps',
    description: 'Containerization technology for packaging applications with isolated OS-level dependencies.',
    marketDemand: 'Very High',
    neo4jColor: '#0284C7' // cyan
  },
  {
    id: 'skill-aws',
    name: 'AWS',
    category: 'Cloud & DevOps',
    description: 'Amazon Web Services cloud architecture, EC2, S3, IAM, Lambda, and serverless compute.',
    marketDemand: 'Very High',
    neo4jColor: '#F59E0B' // amber
  },
  {
    id: 'skill-k8s',
    name: 'Kubernetes',
    category: 'Cloud & DevOps',
    description: 'Container orchestration platform automating deployment, scaling, and operations of application containers.',
    marketDemand: 'High',
    neo4jColor: '#3B82F6' // blue
  },
  {
    id: 'skill-git',
    name: 'Git',
    category: 'Cloud & DevOps',
    description: 'Distributed version control system, branching strategies, and collaborative code reviews.',
    marketDemand: 'High',
    neo4jColor: '#F97316' // orange
  },
  {
    id: 'skill-linux',
    name: 'Linux Command Line',
    category: 'Cloud & DevOps',
    description: 'Shell scripting, file permissions, daemon process management, and SSH administration.',
    marketDemand: 'High',
    neo4jColor: '#F59E0B' // amber
  },

  // Core CS
  {
    id: 'skill-dsa',
    name: 'Data Structures & Algorithms',
    category: 'Core CS & Tools',
    description: 'Graph traversals (BFS/DFS), trees, hash maps, Big-O algorithmic time complexity.',
    marketDemand: 'High',
    neo4jColor: '#8B5CF6' // violet
  }
];

export const ALL_JOBS: JobNode[] = [
  {
    id: 'job-abc-backend',
    title: 'Backend Developer',
    company: 'ABC Technologies',
    experienceLevel: 'Fresher',
    department: 'Backend Engineering',
    description: 'Design robust backend services, microservices and data pipelines using Java, Python, MongoDB, Git, Docker, and AWS.',
    minCgpa: 7.0,
    location: 'Pune',
    salaryRange: '₹4–8 LPA',
    jobType: 'Full Time'
  },
  {
    id: 'job-java-dev',
    title: 'Java Developer',
    company: 'TechNova',
    experienceLevel: 'Fresher',
    department: 'Core Java Systems',
    description: 'Develop enterprise-grade Java web services, robust APIs, and relational SQL data layers.',
    minCgpa: 7.2,
    location: 'Pune',
    salaryRange: '₹4.5–7.5 LPA',
    jobType: 'Full Time'
  },
  {
    id: 'job-swe',
    title: 'Software Engineer',
    company: 'CodeSphere',
    experienceLevel: 'Fresher',
    department: 'Software Engineering',
    description: 'Solve complex computer science problems, build backend services with Python, SQL, Git, and Docker.',
    minCgpa: 7.5,
    location: 'Pune',
    salaryRange: '₹5–8.5 LPA',
    jobType: 'Full Time'
  },
  {
    id: 'job-py-dev',
    title: 'Python Developer',
    company: 'DataWorks',
    experienceLevel: 'Fresher',
    department: 'Python & Data Services',
    description: 'Write clean Python code, automated scripts, backend REST APIs, and MongoDB integrations.',
    minCgpa: 7.0,
    location: 'Pune',
    salaryRange: '₹4–7 LPA',
    jobType: 'Full Time'
  },
  {
    id: 'job-1',
    title: 'Junior Full Stack Developer',
    company: 'TechNova',
    experienceLevel: 'Fresher',
    department: 'Core Web Engineering',
    description: 'Build end-to-end full stack web applications using React, Node.js, Express, and modern database systems.',
    minCgpa: 7.5,
    location: 'Bangalore',
    salaryRange: '₹4.5–8 LPA',
    jobType: 'Full Time'
  },
  {
    id: 'job-2',
    title: 'Cloud & DevOps Associate',
    company: 'CodeSphere',
    experienceLevel: 'Fresher',
    department: 'Infrastructure & DevOps',
    description: 'Deploy containerized web services with Docker, Kubernetes, manage AWS cloud resources, and configure Git pipelines.',
    minCgpa: 7.5,
    location: 'Mumbai',
    salaryRange: '₹5–9 LPA',
    jobType: 'Full Time'
  },
  {
    id: 'job-3',
    title: 'Data & Database Specialist',
    company: 'DataWorks',
    experienceLevel: 'Fresher',
    department: 'Enterprise Data Group',
    description: 'Query, normalize, and optimize database schemas using SQL, PostgreSQL, Python, and NoSQL engines.',
    minCgpa: 7.2,
    location: 'Hyderabad',
    salaryRange: '₹4–7.5 LPA',
    jobType: 'Full Time'
  }
];

// Student-Skill relationships (:Student)-[:HAS_SKILL]->(:Skill)
export const INITIAL_STUDENT_SKILLS: StudentSkillRel[] = [
  // Jitesh Choudhary (Backend Developer target - 5 skills)
  { studentId: 'student-1', skillId: 'skill-java', proficiency: 'Advanced', verified: true, acquiredDate: '2024-01-15' },
  { studentId: 'student-1', skillId: 'skill-py', proficiency: 'Advanced', verified: true, acquiredDate: '2024-02-10' },
  { studentId: 'student-1', skillId: 'skill-mongo', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-04-18' },
  { studentId: 'student-1', skillId: 'skill-sql', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-03-22' },
  { studentId: 'student-1', skillId: 'skill-git', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-05-10' },

  // Priya Verma (Backend / Database target)
  { studentId: 'student-2', skillId: 'skill-node', proficiency: 'Advanced', verified: true, acquiredDate: '2024-01-20' },
  { studentId: 'student-2', skillId: 'skill-express', proficiency: 'Advanced', verified: true, acquiredDate: '2024-02-15' },
  { studentId: 'student-2', skillId: 'skill-ts', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-06-10' },
  { studentId: 'student-2', skillId: 'skill-neo4j', proficiency: 'Advanced', verified: true, acquiredDate: '2024-04-18' },
  { studentId: 'student-2', skillId: 'skill-postgres', proficiency: 'Advanced', verified: true, acquiredDate: '2024-03-05' },
  { studentId: 'student-2', skillId: 'skill-sql', proficiency: 'Advanced', verified: true, acquiredDate: '2024-01-10' },
  { studentId: 'student-2', skillId: 'skill-rest', proficiency: 'Advanced', verified: true, acquiredDate: '2024-04-02' },
  { studentId: 'student-2', skillId: 'skill-docker', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-08-14' },
  { studentId: 'student-2', skillId: 'skill-git', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-02-01' },
  { studentId: 'student-2', skillId: 'skill-dsa', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-05-30' },

  // Aman Patel (Frontend target)
  { studentId: 'student-3', skillId: 'skill-html-css', proficiency: 'Advanced', verified: true, acquiredDate: '2024-03-01' },
  { studentId: 'student-3', skillId: 'skill-js', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-04-12' },
  { studentId: 'student-3', skillId: 'skill-react', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-07-20' },
  { studentId: 'student-3', skillId: 'skill-tailwind', proficiency: 'Advanced', verified: true, acquiredDate: '2024-06-15' },
  { studentId: 'student-3', skillId: 'skill-git', proficiency: 'Beginner', verified: true, acquiredDate: '2024-05-10' },

  // Sneha Roy (DevOps target)
  { studentId: 'student-4', skillId: 'skill-linux', proficiency: 'Advanced', verified: true, acquiredDate: '2024-01-10' },
  { studentId: 'student-4', skillId: 'skill-docker', proficiency: 'Advanced', verified: true, acquiredDate: '2024-03-22' },
  { studentId: 'student-4', skillId: 'skill-git', proficiency: 'Advanced', verified: true, acquiredDate: '2024-02-15' },
  { studentId: 'student-4', skillId: 'skill-py', proficiency: 'Intermediate', verified: true, acquiredDate: '2024-05-10' },
  { studentId: 'student-4', skillId: 'skill-js', proficiency: 'Beginner', verified: true, acquiredDate: '2024-06-01' },
  { studentId: 'student-4', skillId: 'skill-node', proficiency: 'Beginner', verified: true, acquiredDate: '2024-07-15' }
];

// Job-Skill relationships (:Job)-[:REQUIRES_SKILL]->(:Skill)
export const INITIAL_JOB_SKILLS: JobSkillRel[] = [
  // Primary Academic Job: Backend Developer (ABC Technologies, Pune)
  // Required Skills: Java, Python, MongoDB, Git, Docker, AWS (6 skills)
  // Matching for Jitesh Choudhary (Skills: Java, Python, MongoDB, SQL, Git):
  // 4 of 6 skills matched (Java, Python, MongoDB, Git) -> 66.7% Match
  // Missing skills: Docker, AWS
  // If Docker is added (5 of 6 matched) -> 83.3% Match
  { jobId: 'job-abc-backend', skillId: 'skill-java', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-abc-backend', skillId: 'skill-py', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-abc-backend', skillId: 'skill-mongo', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-abc-backend', skillId: 'skill-git', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-abc-backend', skillId: 'skill-docker', importance: 'MANDATORY', minProficiency: 'Beginner' },
  { jobId: 'job-abc-backend', skillId: 'skill-aws', importance: 'PREFERRED', minProficiency: 'Beginner' },

  // Sample Job: Java Developer (TechNova, Pune) - 80% Match for Jitesh (4/5 matched)
  { jobId: 'job-java-dev', skillId: 'skill-java', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-java-dev', skillId: 'skill-sql', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-java-dev', skillId: 'skill-git', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-java-dev', skillId: 'skill-py', importance: 'PREFERRED', minProficiency: 'Intermediate' },
  { jobId: 'job-java-dev', skillId: 'skill-docker', importance: 'PREFERRED', minProficiency: 'Beginner' },

  // Sample Job: Software Engineer (CodeSphere, Pune) - 60% Match for Jitesh (3/5 matched)
  { jobId: 'job-swe', skillId: 'skill-py', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-swe', skillId: 'skill-sql', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-swe', skillId: 'skill-git', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-swe', skillId: 'skill-docker', importance: 'MANDATORY', minProficiency: 'Beginner' },
  { jobId: 'job-swe', skillId: 'skill-k8s', importance: 'PREFERRED', minProficiency: 'Beginner' },

  // Sample Job: Python Developer (DataWorks, Pune) - 80% Match for Jitesh (4/5 matched)
  { jobId: 'job-py-dev', skillId: 'skill-py', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-py-dev', skillId: 'skill-mongo', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-py-dev', skillId: 'skill-sql', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-py-dev', skillId: 'skill-git', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-py-dev', skillId: 'skill-docker', importance: 'PREFERRED', minProficiency: 'Beginner' },

  // Job 1: Junior Full Stack Developer (TechNova, Bangalore)
  { jobId: 'job-1', skillId: 'skill-react', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-1', skillId: 'skill-node', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-1', skillId: 'skill-sql', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-1', skillId: 'skill-git', importance: 'MANDATORY', minProficiency: 'Beginner' },

  // Job 2: Cloud & DevOps Associate (CodeSphere, Mumbai)
  { jobId: 'job-2', skillId: 'skill-docker', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-2', skillId: 'skill-k8s', importance: 'MANDATORY', minProficiency: 'Beginner' },
  { jobId: 'job-2', skillId: 'skill-aws', importance: 'MANDATORY', minProficiency: 'Beginner' },
  { jobId: 'job-2', skillId: 'skill-git', importance: 'MANDATORY', minProficiency: 'Intermediate' },

  // Job 3: Data & Database Specialist (DataWorks, Hyderabad)
  { jobId: 'job-3', skillId: 'skill-sql', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-3', skillId: 'skill-mongo', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-3', skillId: 'skill-py', importance: 'MANDATORY', minProficiency: 'Intermediate' },
  { jobId: 'job-3', skillId: 'skill-aws', importance: 'PREFERRED', minProficiency: 'Beginner' }
];

// Skill synergies (:Skill)-[:SYNERGY_WITH]->(:Skill)
export const SKILL_SYNERGIES: SkillSynergyRel[] = [
  { sourceSkillId: 'skill-react', targetSkillId: 'skill-ts', weight: 0.88, reason: 'High industry co-adoption for type-safe components.' },
  { sourceSkillId: 'skill-node', targetSkillId: 'skill-express', weight: 0.95, reason: 'Standard runtime and HTTP framework pair in JavaScript.' },
  { sourceSkillId: 'skill-node', targetSkillId: 'skill-neo4j', weight: 0.76, reason: 'Native neo4j-driver integration for high throughput REST graphs.' },
  { sourceSkillId: 'skill-docker', targetSkillId: 'skill-linux', weight: 0.92, reason: 'Underlying cgroups, namespaces, and shell automation.' },
  { sourceSkillId: 'skill-postgres', targetSkillId: 'skill-sql', weight: 0.99, reason: 'Core declarative SQL dialect adherence.' },
  { sourceSkillId: 'skill-neo4j', targetSkillId: 'skill-dsa', weight: 0.84, reason: 'Direct application of graph traversal algorithms (BFS/DFS).' }
];

// Academic Cypher Query Templates
export const CYPHER_QUERIES: CypherQueryTemplate[] = [
  {
    id: 'query-1',
    title: 'Graph Skill Overlap & Jaccard Percentage',
    category: 'Matching',
    description: 'Calculates the intersection of student skills and required job skills, yielding match percentage and missing skill counts.',
    academicNotes: 'In traditional SQL, this requires 3 multi-table JOINs across Students, Student_Skills, Job_Skills, and Jobs with expensive grouping. Neo4j evaluates this in O(d) index-free adjacency traversal.',
    query: `// Query 1: Match Student to Jobs via Shared Skills
MATCH (s:Student {id: $studentId})-[:HAS_SKILL]->(sk:Skill)<-[r:REQUIRES_SKILL]-(j:Job)
WITH j, count(sk) AS matchedSkillCount, collect(sk.name) AS matchedSkills
MATCH (j)-[allR:REQUIRES_SKILL]->(allSk:Skill)
WITH j, matchedSkillCount, matchedSkills, count(allSk) AS totalRequiredCount, collect(allSk.name) AS allJobSkills
RETURN j.title AS jobTitle,
       j.company AS company,
       matchedSkillCount,
       totalRequiredCount,
       round((toFloat(matchedSkillCount) / totalRequiredCount) * 100, 1) AS matchPercentage,
       matchedSkills,
       [s IN allJobSkills WHERE NOT s IN matchedSkills] AS missingSkills
ORDER BY matchPercentage DESC;`,
    parameters: { studentId: 'student-1' },
    complexity: 'O(deg(s) + deg(j)) using native graph pointer hops'
  },
  {
    id: 'query-2',
    title: 'Skill Gap Analysis for a Specific Job',
    category: 'Gap Analysis',
    description: 'Finds all skills required by a specific target job that the student does not currently possess, categorized by importance.',
    academicNotes: 'Calculates the set difference (JobRequirements \\ StudentSkills) in a single traversal pass using Neo4j pattern comprehension.',
    query: `// Query 2: Identify Missing Skill Gap Set for Target Job
MATCH (j:Job {id: $jobId})-[r:REQUIRES_SKILL]->(sk:Skill)
WHERE NOT EXISTS {
  MATCH (s:Student {id: $studentId})-[:HAS_SKILL]->(sk)
}
RETURN sk.name AS missingSkill,
       sk.category AS category,
       r.importance AS importance,
       r.minProficiency AS minRequiredProficiency
ORDER BY r.importance DESC, sk.name ASC;`,
    parameters: { studentId: 'student-1', jobId: 'job-abc-backend' },
    complexity: 'O(deg(j)) with subquery pattern check'
  },
  {
    id: 'query-3',
    title: 'High-Impact Bridge Skill Discovery',
    category: 'Recommendations',
    description: 'Discovers which missing skills, if learned, will unlock the highest number of new jobs or produce the highest cumulative match score boost.',
    academicNotes: 'Collaborative filtering / bridge node detection. Evaluates how candidate skill nodes connect into multiple disconnected job nodes.',
    query: `// Query 3: Bridge Skill Optimization
MATCH (s:Student {id: $studentId})
MATCH (missing:Skill)<-[r:REQUIRES_SKILL]-(j:Job)
WHERE NOT (s)-[:HAS_SKILL]->(missing)
WITH missing, count(DISTINCT j) AS unlockJobCount, collect(j.title) AS targetJobs
RETURN missing.name AS bridgeSkill,
       missing.category AS category,
       unlockJobCount,
       targetJobs
ORDER BY unlockJobCount DESC, missing.name ASC
LIMIT 5;`,
    parameters: { studentId: 'student-1' },
    complexity: 'O(E_missing) 2-hop bipartite expansion'
  },
  {
    id: 'query-4',
    title: 'Graph Schema Visualization & Degree Metrics',
    category: 'Schema & Metrics',
    description: 'Inspects active node counts and relationship degree distributions across the JobGraph database schema.',
    academicNotes: 'Neo4j stores metadata counts directly in transaction state headers without scanning entire tables.',
    query: `// Query 4: Schema & Node Degree Summary
MATCH (s:Student) WITH count(s) AS totalStudents
MATCH (sk:Skill) WITH totalStudents, count(sk) AS totalSkills
MATCH (j:Job) WITH totalStudents, totalSkills, count(j) AS totalJobs
MATCH ()-[r1:HAS_SKILL]->() WITH totalStudents, totalSkills, totalJobs, count(r1) AS studentSkillEdges
MATCH ()-[r2:REQUIRES_SKILL]->() WITH totalStudents, totalSkills, totalJobs, studentSkillEdges, count(r2) AS jobSkillEdges
RETURN totalStudents, totalSkills, totalJobs, studentSkillEdges, jobSkillEdges;`,
    parameters: {},
    complexity: 'O(1) label index & relationship counter lookup'
  }
];
