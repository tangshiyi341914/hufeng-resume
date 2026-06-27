// 简历数据类型定义

export interface BasicInfo {
  fullName: string;
  title: string;       // UI 显示为"意向岗位"
  gender: string;      // 男 / 女
  age: string;         // 年龄
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  photo: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Internship {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  level: string;        // 学校等级: 985, 211, 双一流, 一本, 二本 等
  lab: string;           // 实验室（选填）
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  basicInfo: BasicInfo;
  workExperience: WorkExperience[];
  internships: Internship[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: Language[];
  certifications: Certification[];
}

export type TemplateType = 'classic' | 'modern' | 'minimal';

// 文字颜色等级（从浅灰到深黑）
export type TextColorLevel = 'gray-300' | 'gray-400' | 'gray-500' | 'gray-600' | 'gray-700' | 'gray-800' | 'gray-900';

export const textColorMap: Record<TextColorLevel, string> = {
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
};

export const textColorLabels: Record<TextColorLevel, string> = {
  'gray-300': '极浅灰',
  'gray-400': '浅灰',
  'gray-500': '中灰',
  'gray-600': '深灰',
  'gray-700': '浅黑',
  'gray-800': '中黑',
  'gray-900': '深黑',
};

// 每个模块各字段的颜色配置
export interface FieldColors {
  // 基本信息
  basicName: TextColorLevel;
  basicTitle: TextColorLevel;
  basicMeta: TextColorLevel;
  basicContact: TextColorLevel;
  basicSummary: TextColorLevel;
  // 工作经历
  workCompany: TextColorLevel;
  workPosition: TextColorLevel;
  workDate: TextColorLevel;
  workDesc: TextColorLevel;
  // 实习经历
  internCompany: TextColorLevel;
  internPosition: TextColorLevel;
  internDate: TextColorLevel;
  internDesc: TextColorLevel;
  // 教育背景
  eduSchool: TextColorLevel;
  eduDetail: TextColorLevel;
  eduDate: TextColorLevel;
  // 技能
  skillName: TextColorLevel;
  skillLevel: TextColorLevel;
  skillDesc: TextColorLevel;
  // 项目经历
  projName: TextColorLevel;
  projLink: TextColorLevel;
  projTech: TextColorLevel;
  projDesc: TextColorLevel;
  // 语言能力
  langName: TextColorLevel;
  langProf: TextColorLevel;
  // 证书资质
  certName: TextColorLevel;
  certIssuer: TextColorLevel;
  certDate: TextColorLevel;
  // 模块标题
  sectionTitle: TextColorLevel;
}

export const defaultFieldColors: FieldColors = {
  basicName: 'gray-900',
  basicTitle: 'gray-700',
  basicMeta: 'gray-600',
  basicContact: 'gray-600',
  basicSummary: 'gray-600',
  workCompany: 'gray-800',
  workPosition: 'gray-800',
  workDate: 'gray-400',
  workDesc: 'gray-600',
  internCompany: 'gray-700',
  internPosition: 'gray-700',
  internDate: 'gray-900',
  internDesc: 'gray-900',
  eduSchool: 'gray-800',
  eduDetail: 'gray-800',
  eduDate: 'gray-800',
  skillName: 'gray-700',
  skillLevel: 'gray-300',
  skillDesc: 'gray-600',
  projName: 'gray-800',
  projLink: 'gray-400',
  projTech: 'gray-400',
  projDesc: 'gray-600',
  langName: 'gray-600',
  langProf: 'gray-400',
  certName: 'gray-600',
  certIssuer: 'gray-400',
  certDate: 'gray-400',
  sectionTitle: 'gray-600',
};

// 简历排版配置（用户自定义 px 数值）
export interface ResumeConfig {
  nameSize: number;         // 姓名字号 px，默认 28
  sectionTitleSize: number; // 模块标题字号 px，默认 11
  bodySize: number;         // 正文字号 px，默认 13
  lineHeight: number;       // 行高倍数，默认 1.6
  sectionSpacing: number;   // 模块间距 px，默认 24
  itemSpacing: number;      // 模块内项间距 px，默认 12，最小值 2
  pageMarginX: number;      // 左右页边距 px，默认 32
  pageMarginY: number;      // 上下页边距 px，默认 32
  themeColor: string;       // 主题色（模块标题及分界线），默认 #2563eb
  fieldColors: FieldColors; // 各字段文字颜色
}

export type SectionKey = 'workExperience' | 'internships' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications';

export const defaultSectionOrder: SectionKey[] = ['education', 'internships', 'workExperience', 'projects', 'skills', 'languages', 'certifications'];

export interface Resume {
  id?: string;
  title: string;
  template: TemplateType;
  data: ResumeData;
  config: ResumeConfig;
  sectionOrder: SectionKey[];
  createdAt?: string;
  updatedAt?: string;
}

export const defaultConfig: ResumeConfig = {
  nameSize: 26,
  sectionTitleSize: 16,
  bodySize: 13,
  lineHeight: 1.3,
  sectionSpacing: 2,
  itemSpacing: 2,
  pageMarginX: 22,
  pageMarginY: 18,
  themeColor: '#247aeb',
  fieldColors: { ...defaultFieldColors },
};

export const defaultResumeData: ResumeData = {
  basicInfo: {
    fullName: '',
    title: '',
    gender: '',
    age: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
    photo: '/photo.jpg',
  },
  workExperience: [],
  internships: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [],
};
