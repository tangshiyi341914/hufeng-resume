import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { Resume } from '../src/types/resume.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data.json');

interface StoredResume extends Resume {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface DataStore {
  resumes: StoredResume[];
}

function initData(): void {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ resumes: [] }, null, 2), 'utf-8');
  }
}

function readData(): DataStore {
  initData();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as DataStore;
}

function writeData(data: DataStore): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getAllResumes(): StoredResume[] {
  const data = readData();
  return data.resumes
    .map((r) => ({ ...r }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getResumeById(id: string): StoredResume | null {
  const data = readData();
  return data.resumes.find((r) => r.id === id) ?? null;
}

export function createResume(resumeData: Pick<Resume, 'title' | 'template' | 'data' | 'config' | 'sectionOrder'>): StoredResume {
  const data = readData();
  const now = new Date().toISOString();
  const newResume: StoredResume = {
    id: uuidv4(),
    title: resumeData.title || '未命名简历',
    template: resumeData.template || 'classic',
    data: resumeData.data,
    config: resumeData.config,
    sectionOrder: resumeData.sectionOrder,
    createdAt: now,
    updatedAt: now,
  };
  data.resumes.push(newResume);
  writeData(data);
  return newResume;
}

export function updateResume(
  id: string,
  resumeData: Pick<Resume, 'title' | 'template' | 'data' | 'config' | 'sectionOrder'>
): StoredResume | null {
  const data = readData();
  const index = data.resumes.findIndex((r) => r.id === id);
  if (index === -1) return null;

  data.resumes[index] = {
    ...data.resumes[index],
    title: resumeData.title ?? data.resumes[index].title,
    template: resumeData.template ?? data.resumes[index].template,
    data: resumeData.data ?? data.resumes[index].data,
    config: resumeData.config ?? data.resumes[index].config,
    sectionOrder: resumeData.sectionOrder ?? data.resumes[index].sectionOrder,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return data.resumes[index];
}

export function deleteResume(id: string): boolean {
  const data = readData();
  const index = data.resumes.findIndex((r) => r.id === id);
  if (index === -1) return false;
  data.resumes.splice(index, 1);
  writeData(data);
  return true;
}
