import { create } from 'zustand';
import { Resume, ResumeData, ResumeConfig, TemplateType, defaultResumeData, defaultConfig, defaultSectionOrder, defaultFieldColors } from '../types/resume';
import { v4 as uuidv4 } from 'uuid';
import * as api from '../api';

interface ResumeStore {
  currentResume: Resume;
  saving: boolean;
  dirty: boolean;

  // 模板
  setTemplate: (template: TemplateType) => void;
  setTitle: (title: string) => void;
  // 配置
  updateConfig: (config: Partial<ResumeConfig>) => void;

  // 基本信息
  updateBasicInfo: (info: Partial<ResumeData['basicInfo']>) => void;
  // 工作经历
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, data: Partial<ResumeData['workExperience'][0]>) => void;
  removeWorkExperience: (id: string) => void;
  // 实习经历
  addInternship: () => void;
  updateInternship: (id: string, data: Partial<ResumeData['internships'][0]>) => void;
  removeInternship: (id: string) => void;
  // 教育
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<ResumeData['education'][0]>) => void;
  removeEducation: (id: string) => void;
  // 技能
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<ResumeData['skills'][0]>) => void;
  removeSkill: (id: string) => void;
  // 项目
  addProject: () => void;
  updateProject: (id: string, data: Partial<ResumeData['projects'][0]>) => void;
  removeProject: (id: string) => void;
  // 语言
  addLanguage: () => void;
  updateLanguage: (id: string, data: Partial<ResumeData['languages'][0]>) => void;
  removeLanguage: (id: string) => void;
  // 证书
  addCertification: () => void;
  updateCertification: (id: string, data: Partial<ResumeData['certifications'][0]>) => void;
  removeCertification: (id: string) => void;

  // 拖拽排序
  reorderWorkExperience: (from: number, to: number) => void;
  reorderInternships: (from: number, to: number) => void;
  reorderEducation: (from: number, to: number) => void;
  reorderSkills: (from: number, to: number) => void;
  reorderProjects: (from: number, to: number) => void;
  reorderLanguages: (from: number, to: number) => void;
  reorderCertifications: (from: number, to: number) => void;

  reorderSections: (from: number, to: number) => void;

  loadResume: (resume: Resume) => void;
  resetResume: () => void;
  saveResume: () => Promise<Resume | null>;
}

const defData = () => JSON.parse(JSON.stringify(defaultResumeData));

export const useResumeStore = create<ResumeStore>((set, get) => ({
  currentResume: {
    title: '未命名简历',
    template: 'classic',
    data: defData(),
    config: { ...defaultConfig, fieldColors: { ...defaultFieldColors } },
    sectionOrder: [...defaultSectionOrder],
  },
  saving: false,
  dirty: false,

  setTemplate: (template) =>
    set((s) => ({ currentResume: { ...s.currentResume, template }, dirty: true })),

  setTitle: (title) =>
    set((s) => ({ currentResume: { ...s.currentResume, title }, dirty: true })),

  updateConfig: (cfg) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        config: { ...s.currentResume.config, ...cfg },
      },
      dirty: true,
    })),

  updateBasicInfo: (info) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, basicInfo: { ...s.currentResume.data.basicInfo, ...info } },
      },
      dirty: true,
    })),

  addWorkExperience: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: {
          ...s.currentResume.data,
          workExperience: [...s.currentResume.data.workExperience,
            { id: uuidv4(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' }],
        },
      },
      dirty: true,
    })),
  updateWorkExperience: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, workExperience: s.currentResume.data.workExperience.map((e) => e.id === id ? { ...e, ...d } : e) },
      },
      dirty: true,
    })),
  removeWorkExperience: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, workExperience: s.currentResume.data.workExperience.filter((e) => e.id !== id) },
      },
      dirty: true,
    })),

  addInternship: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: {
          ...s.currentResume.data,
          internships: [...s.currentResume.data.internships,
            { id: uuidv4(), company: '', position: '', startDate: '', endDate: '', description: '' }],
        },
      },
      dirty: true,
    })),
  updateInternship: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, internships: s.currentResume.data.internships.map((i) => i.id === id ? { ...i, ...d } : i) },
      },
      dirty: true,
    })),
  removeInternship: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, internships: s.currentResume.data.internships.filter((i) => i.id !== id) },
      },
      dirty: true,
    })),

  addEducation: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: {
          ...s.currentResume.data,
          education: [...s.currentResume.data.education,
            { id: uuidv4(), school: '', degree: '', field: '', level: '', lab: '', startDate: '', endDate: '', description: '' }],
        },
      },
      dirty: true,
    })),
  updateEducation: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, education: s.currentResume.data.education.map((e) => e.id === id ? { ...e, ...d } : e) },
      },
      dirty: true,
    })),
  removeEducation: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, education: s.currentResume.data.education.filter((e) => e.id !== id) },
      },
      dirty: true,
    })),

  addSkill: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, skills: [...s.currentResume.data.skills, { id: uuidv4(), name: '', level: 3, description: '' }] },
      },
      dirty: true,
    })),
  updateSkill: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, skills: s.currentResume.data.skills.map((sk) => sk.id === id ? { ...sk, ...d } : sk) },
      },
      dirty: true,
    })),
  removeSkill: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, skills: s.currentResume.data.skills.filter((sk) => sk.id !== id) },
      },
      dirty: true,
    })),

  addProject: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, projects: [...s.currentResume.data.projects, { id: uuidv4(), name: '', description: '', link: '', technologies: '' }] },
      },
      dirty: true,
    })),
  updateProject: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, projects: s.currentResume.data.projects.map((p) => p.id === id ? { ...p, ...d } : p) },
      },
      dirty: true,
    })),
  removeProject: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, projects: s.currentResume.data.projects.filter((p) => p.id !== id) },
      },
      dirty: true,
    })),

  addLanguage: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, languages: [...s.currentResume.data.languages, { id: uuidv4(), name: '', proficiency: '良好' }] },
      },
      dirty: true,
    })),
  updateLanguage: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, languages: s.currentResume.data.languages.map((l) => l.id === id ? { ...l, ...d } : l) },
      },
      dirty: true,
    })),
  removeLanguage: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, languages: s.currentResume.data.languages.filter((l) => l.id !== id) },
      },
      dirty: true,
    })),

  addCertification: () =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, certifications: [...s.currentResume.data.certifications, { id: uuidv4(), name: '', issuer: '', date: '' }] },
      },
      dirty: true,
    })),
  updateCertification: (id, d) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, certifications: s.currentResume.data.certifications.map((c) => c.id === id ? { ...c, ...d } : c) },
      },
      dirty: true,
    })),
  removeCertification: (id) =>
    set((s) => ({
      currentResume: {
        ...s.currentResume,
        data: { ...s.currentResume.data, certifications: s.currentResume.data.certifications.filter((c) => c.id !== id) },
      },
      dirty: true,
    })),

  // ===== 拖拽排序 =====
  reorderWorkExperience: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.workExperience];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, workExperience: arr } }, dirty: true };
    }),
  reorderInternships: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.internships];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, internships: arr } }, dirty: true };
    }),
  reorderEducation: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.education];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, education: arr } }, dirty: true };
    }),
  reorderSkills: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.skills];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, skills: arr } }, dirty: true };
    }),
  reorderProjects: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.projects];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, projects: arr } }, dirty: true };
    }),
  reorderLanguages: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.languages];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, languages: arr } }, dirty: true };
    }),
  reorderCertifications: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.data.certifications];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, data: { ...s.currentResume.data, certifications: arr } }, dirty: true };
    }),

  reorderSections: (from, to) =>
    set((s) => {
      const arr = [...s.currentResume.sectionOrder];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { currentResume: { ...s.currentResume, sectionOrder: arr }, dirty: true };
    }),
  loadResume: (resume) => {
    // 兼容旧数据 — 迁移 pageMargin → pageMarginX/pageMarginY，以及补充缺失字段
    const oldCfg = resume.config || ({} as any);
    const migrated: ResumeConfig = {
      ...defaultConfig,
      ...oldCfg,
      itemSpacing: oldCfg.itemSpacing ?? 12,
      pageMarginX: oldCfg.pageMarginX ?? oldCfg.pageMargin ?? 32,
      pageMarginY: oldCfg.pageMarginY ?? oldCfg.pageMargin ?? 32,
      themeColor: oldCfg.themeColor ?? '#2563eb',
      fieldColors: oldCfg.fieldColors ? { ...defaultFieldColors, ...oldCfg.fieldColors } : { ...defaultFieldColors },
    };
    // 清理旧字段 pageMargin（避免类型不匹配）
    delete (migrated as any).pageMargin;
    const restored = {
      ...resume,
      config: migrated,
      sectionOrder: resume.sectionOrder || [...defaultSectionOrder],
      // 迁移技能数据 — 补充缺失的 description 字段
      data: {
        ...resume.data,
        skills: (resume.data.skills || []).map((s) => ({ description: '', ...s })),
      },
    };
    set({ currentResume: restored, dirty: false });
  },

  resetResume: () =>
    set({
      currentResume: { title: '未命名简历', template: 'classic', data: defData(), config: { ...defaultConfig, fieldColors: { ...defaultFieldColors } }, sectionOrder: [...defaultSectionOrder] },
      dirty: false,
    }),

  saveResume: async () => {
    set({ saving: true });
    try {
      const r = get().currentResume;
      const saved = r.id ? await api.updateResume(r.id, r) : await api.createResume(r);
      set({ currentResume: { ...saved, sectionOrder: saved.sectionOrder || [...defaultSectionOrder] }, dirty: false, saving: false });
      return saved;
    } catch (e) {
      console.error('保存失败:', e);
      set({ saving: false });
      return null;
    }
  },
}));
