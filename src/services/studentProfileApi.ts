import { SkillNode, StudentNode, ProficiencyLevel } from '../types/graph';

const TOKEN_KEY = 'jobgraph_access_token';

export interface StudentSkillRecord {
  skill: SkillNode;
  proficiency: ProficiencyLevel;
  verified: boolean;
  acquiredDate: string;
}

export interface StudentProfile extends StudentNode {
  bio?: string;
}

interface ProfileResponse {
  success: boolean;
  profile: StudentProfile & { skills: StudentSkillRecord[] };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Your session has expired. Please log in again.');
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.detail ?? body?.error ?? body?.message;
    throw new Error(typeof detail === 'string' ? detail : `Request failed (${response.status}).`);
  }
  return body as T;
}

export const studentProfileApi = {
  async getMe(): Promise<{ profile: StudentProfile; skills: StudentSkillRecord[] }> {
    const result = await request<ProfileResponse>('/api/students/me');
    if (!result.success || !result.profile) throw new Error('The API returned an invalid student profile.');
    const { skills, ...profile } = result.profile;
    return { profile, skills: skills || [] };
  },

  async getSkills(): Promise<SkillNode[]> {
    const result = await request<{ success: boolean; skills: SkillNode[] }>('/api/skills');
    if (!result.success || !Array.isArray(result.skills)) throw new Error('The API returned an invalid skill catalogue.');
    return result.skills;
  },

  async saveSkills(skills: Array<{ id: string; proficiency: ProficiencyLevel }>): Promise<StudentSkillRecord[]> {
    const result = await request<{ success: boolean; skills: StudentSkillRecord[] }>('/api/students/me/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
    if (!result.success || !Array.isArray(result.skills)) throw new Error('The API returned an invalid skills response.');
    return result.skills;
  },

  async saveProfile(
    updates: { name: string; degree: string; experienceLevel: string; preferredLocation: string; targetRole?: string; bio?: string },
    skillIds: string[],
  ): Promise<{ profile: StudentProfile; skills: StudentSkillRecord[] }> {
    const result = await request<ProfileResponse>('/api/students/me', {
      method: 'PUT',
      body: JSON.stringify({ ...updates, skillIds }),
    });
    if (!result.success || !result.profile) throw new Error('The API returned an invalid profile response.');
    const { skills, ...profile } = result.profile;
    return { profile, skills: skills || [] };
  },
};
