import React from 'react';
import { ResumeData, ResumeConfig, Skill, Language, Certification, WorkExperience, Internship, Education, Project } from '../../types/resume';
import { applyConfig, renderRichText, colorFor } from '../../utils/resumeConfig';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

type SectionKey = 'workExperience' | 'internships' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications';

interface Props {
  data: ResumeData;
  config: ResumeConfig;
  sectionOrder: SectionKey[];
}

export default function ClassicTemplate({ data, config, sectionOrder }: Props) {
  const { basicInfo } = data;
  const hasAny = basicInfo.fullName || data.workExperience.length > 0 || data.education.length > 0;
  const C = applyConfig(config);
  const accentColor = C.themeColor;
  const fc = config.fieldColors;

  if (!hasAny) {
    return <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2"><span className="text-4xl">📄</span><p className="text-sm">在左侧填写信息，预览实时更新</p></div>;
  }

  return (
    <div style={{ fontFamily: `'Noto Serif SC', 'SimSun', Georgia, serif`, color: colorFor(fc.basicSummary), fontSize: C.bodySize, lineHeight: C.lineHeight, paddingTop: C.pageMarginY, paddingBottom: C.pageMarginY, paddingLeft: C.pageMarginX, paddingRight: C.pageMarginX }}>
      {/* 头部（固定） */}
      <Header basicInfo={basicInfo} C={C} accentColor={accentColor} fc={fc} />

      {/* 按 sectionOrder 动态渲染模块 */}
      {(sectionOrder || ['workExperience', 'internships', 'education', 'skills', 'projects', 'languages', 'certifications']).map((key) => (
        <React.Fragment key={key}>{renderSection(key, data, C, accentColor, fc)}</React.Fragment>
      ))}
    </div>
  );
}

// ===== 头部 =====
function Header({ basicInfo, C, accentColor, fc }: { basicInfo: any; C: any; accentColor: string; fc: any }) {
  return (
    <>
      <div data-pagination-block className="flex items-start gap-4 pb-0.5" style={{ marginBottom: C.sectionSpacing }}>
        {basicInfo.photo && <div className="flex-shrink-0"><img src={basicInfo.photo} alt="照片" className="w-[90px] h-[120px] object-cover border border-gray-200" /></div>}
        <div className="flex-1 text-center">
          {basicInfo.fullName && <h1 className="font-bold tracking-wide mb-1" style={{ fontSize: C.nameSize, color: colorFor(fc.basicName) }}>{basicInfo.fullName}</h1>}
          {basicInfo.title && <p style={{ fontSize: C.bodySize, color: colorFor(fc.basicTitle) }}>意向岗位：{basicInfo.title}</p>}
          {(basicInfo.gender || basicInfo.age) && <p className="mt-0.5 mb-1.5" style={{ fontSize: `calc(${C.bodySize} - 1px)`, color: colorFor(fc.basicMeta) }}>{[basicInfo.gender, basicInfo.age ? `${basicInfo.age}岁` : ''].filter(Boolean).join(' · ')}</p>}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-1" style={{ fontSize: `calc(${C.bodySize} - 2px)`, color: colorFor(fc.basicContact) }}>
            {basicInfo.email && <span className="inline-flex items-center gap-1"><Mail size={11} />{basicInfo.email}</span>}
            {basicInfo.phone && <span className="inline-flex items-center gap-1"><Phone size={11} />{basicInfo.phone}</span>}
            {basicInfo.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{basicInfo.location}</span>}
            {basicInfo.website && <span className="inline-flex items-center gap-1"><Globe size={11} />{basicInfo.website}</span>}
          </div>
        </div>
      </div>
      {basicInfo.summary && (
        <div data-pagination-block style={{ marginBottom: C.sectionSpacing }}>
          <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>个人简介</SectionTitle>
          <div style={{ color: colorFor(fc.basicSummary) }}>{renderRichText(basicInfo.summary)}</div>
        </div>
      )}
    </>
  );
}

// ===== 根据 key 渲染对应模块 =====
function renderSection(key: SectionKey, data: ResumeData, C: any, accentColor: string, fc: any) {
  switch (key) {
    case 'workExperience':
      return data.workExperience.length > 0 ? <WorkSection data={data.workExperience} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'internships':
      return data.internships.length > 0 ? <InternshipSection data={data.internships} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'education':
      return data.education.length > 0 ? <EducationSection data={data.education} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'skills':
      return data.skills.length > 0 ? <SkillsSection data={data.skills} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'projects':
      return data.projects.length > 0 ? <ProjectsSection data={data.projects} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'languages':
      return data.languages.length > 0 ? <LangCertSection languages={data.languages} certifications={[]} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'certifications':
      return data.certifications.length > 0 && !data.languages.length ? <LangCertSection languages={[]} certifications={data.certifications} C={C} accentColor={accentColor} fc={fc} /> : null;
    default:
      return null;
  }
}

// ===== 各模块组件 =====
function WorkSection({ data: items, C, accentColor, fc }: { data: WorkExperience[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>工作经历</SectionTitle>
      {items.map((exp, idx) => (
        <div key={exp.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="flex justify-between items-baseline mb-1">
            <div>
              {exp.company && <span className="font-bold" style={{ color: colorFor(fc.workCompany) }}>{exp.company}</span>}
              {exp.position && <span className="font-bold" style={{ color: colorFor(fc.workPosition), marginLeft: exp.company ? '2em' : '0' }}>{exp.position}</span>}
            </div>
            <span style={{ color: colorFor(fc.workDate), fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(exp.startDate)} — {exp.current ? '至今' : fmtDate(exp.endDate)}</span>
          </div>
          {exp.description && <div style={{ color: colorFor(fc.workDesc) }}>{renderRichText(exp.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function InternshipSection({ data: items, C, accentColor, fc }: { data: Internship[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>实习经历</SectionTitle>
      {items.map((intern, idx) => (
        <div key={intern.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="flex justify-between items-baseline mb-1">
            <div>
              {intern.company && <span className="font-bold" style={{ color: colorFor(fc.internCompany) }}>{intern.company}</span>}
              {intern.position && <span className="font-bold" style={{ color: colorFor(fc.internPosition), marginLeft: intern.company ? '2em' : '0' }}>{intern.position}</span>}
            </div>
            <span style={{ color: colorFor(fc.internDate), fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(intern.startDate)} — {fmtDate(intern.endDate)}</span>
          </div>
          {intern.description && <div style={{ color: colorFor(fc.internDesc) }}>{renderRichText(intern.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function EducationSection({ data: items, C, accentColor, fc }: { data: Education[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>教育背景</SectionTitle>
      {items.map((edu, idx) => (
        <div key={edu.id} data-pagination-block className="flex justify-between items-baseline" style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div>
            <span className="font-bold" style={{ color: colorFor(fc.eduSchool) }}>{edu.school}{edu.level ? `（${edu.level}）` : ''}</span>
            {edu.field && <span style={{ color: colorFor(fc.eduDetail) }}> · {edu.field}</span>}
            {edu.degree && <span style={{ color: colorFor(fc.eduDetail) }}> · {edu.degree}</span>}
            {edu.lab && <span style={{ color: colorFor(fc.eduDetail) }}> · {edu.lab}</span>}
          </div>
          <span style={{ color: colorFor(fc.eduDate), fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(edu.startDate)} — {fmtDate(edu.endDate)}</span>
        </div>
      ))}
    </div>
  );
}

function SkillsSection({ data: items, C, accentColor, fc }: { data: Skill[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>专业技能</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {items.map((skill) => (
          <span key={skill.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200" style={{ fontSize: C.bodySize, color: colorFor(fc.skillName) }}>
            {skill.name}<span style={{ color: colorFor(fc.skillLevel) }}>{'●'.repeat(skill.level)}{'○'.repeat(5 - skill.level)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection({ data: items, C, accentColor, fc }: { data: Project[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>项目经历</SectionTitle>
      {items.map((proj, idx) => (
        <div key={proj.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="flex justify-between items-baseline mb-1">
            <div>
              <span className="font-bold" style={{ color: colorFor(fc.projName) }}>{proj.name}</span>
              {proj.technologies && <span className="font-bold" style={{ color: colorFor(fc.projTech), marginLeft: proj.name ? '2em' : '0' }}>{proj.technologies}</span>}
            </div>
            {proj.link && <span className="font-normal underline" style={{ color: colorFor(fc.projLink), fontSize: `calc(${C.bodySize} - 2px)` }}>{proj.link}</span>}
          </div>
          {proj.description && <div style={{ color: colorFor(fc.projDesc) }}>{renderRichText(proj.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function LangCertSection({ languages, certifications, C, accentColor, fc }: { languages: Language[]; certifications: Certification[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <div className="flex gap-12">
        {languages.length > 0 && (
          <div>
            <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>语言能力</SectionTitle>
            {languages.map((lang, idx) => <p key={lang.id} style={{ fontSize: C.bodySize, color: colorFor(fc.langName), ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>{lang.name} — <span style={{ color: colorFor(fc.langProf) }}>{lang.proficiency}</span></p>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <SectionTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>证书资质</SectionTitle>
            {certifications.map((cert, idx) => (
              <p key={cert.id} style={{ fontSize: C.bodySize, color: colorFor(fc.certName), ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>{cert.name}{cert.issuer && <span style={{ color: colorFor(fc.certIssuer) }}> · {cert.issuer}</span>}{cert.date && <span style={{ color: colorFor(fc.certDate) }}> · {fmtDate(cert.date)}</span>}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children, color, size, fc }: { children: React.ReactNode; color: string; size: string; fc: any }) {
  return <h2 className="font-bold uppercase tracking-[3px] pb-0.5 border-b-[1.2px]" style={{ color, borderColor: color, fontSize: size, marginBottom: '4px' }}>{children}</h2>;
}

function fmtDate(d: string) { if (!d) return ''; return d.replace(/-/g, '.'); }
