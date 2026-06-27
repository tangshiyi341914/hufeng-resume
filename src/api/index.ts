import { Resume } from '../types/resume';

const BASE = '/api';

export async function createResume(resume: Resume): Promise<Resume> {
  const { id, createdAt, updatedAt, ...body } = resume;
  const res = await fetch(`${BASE}/resumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('创建失败');
  return res.json();
}

export async function getResumes(): Promise<Resume[]> {
  const res = await fetch(`${BASE}/resumes`);
  if (!res.ok) throw new Error('获取列表失败');
  return res.json();
}

export async function getResume(id: string): Promise<Resume> {
  const res = await fetch(`${BASE}/resumes/${id}`);
  if (!res.ok) throw new Error('获取失败');
  return res.json();
}

export async function updateResume(id: string, resume: Resume): Promise<Resume> {
  const { id: _id, createdAt, updatedAt, ...body } = resume;
  const res = await fetch(`${BASE}/resumes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('更新失败');
  return res.json();
}

export async function deleteResume(id: string): Promise<void> {
  const res = await fetch(`${BASE}/resumes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除失败');
}
