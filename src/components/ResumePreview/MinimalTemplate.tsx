import React from 'react';
import { ResumeData, ResumeConfig, WorkExperience, Internship, Education, Skill, Project, Language, Certification } from '../../types/resume';
import { applyConfig, renderRichText, colorFor } from '../../utils/resumeConfig';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

type SectionKey = 'workExperience' | 'internships' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications';

interface Props { data: ResumeData; config: ResumeConfig; sectionOrder: SectionKey[]; }

export default function MinimalTemplate({ data, config, sectionOrder }: Props) {
  const { basicInfo } = data;
  const hasAny = basicInfo.fullName || data.workExperience.length > 0 || data.education.length > 0;
  const C = applyConfig(config);
  const accentColor = C.themeColor;
  const fc = config.fieldColors;

  if (!hasAny) {
    return <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2"><span className="text-4xl">📄</span><p className="text-sm">在左侧填写信息，预览实时更新</p></div>;
  }

  return (
    <div style={{ fontFamily: `'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif`, color: colorFor(fc.basicSummary), fontSize: C.bodySize, lineHeight: C.lineHeight, paddingTop: C.pageMarginY, paddingBottom: C.pageMarginY, paddingLeft: C.pageMarginX, paddingRight: C.pageMarginX }}>
      {/* 头部 — 无分界线 */}
      <div data-pagination-block className="flex items-start gap-5" style={{ marginBottom: C.sectionSpacing }}>
        {basicInfo.photo && <div className="flex-shrink-0"><img src={basicInfo.photo} alt="照片" className="w-[90px] h-[120px] object-cover" /></div>}
        <div className="flex-1 text-center">
          {basicInfo.fullName && <h1 className="font-light tracking-wide mb-1.5" style={{ fontSize: C.nameSize, color: colorFor(fc.basicName) }}>{basicInfo.fullName}</h1>}
          {basicInfo.title && <p className="font-light mb-1" style={{ fontSize: C.bodySize, color: colorFor(fc.basicTitle) }}>意向岗位：{basicInfo.title}</p>}
          {(basicInfo.gender || basicInfo.age) && <p className="font-light mb-1.5" style={{ fontSize: `calc(${C.bodySize} - 1px)`, color: colorFor(fc.basicMeta) }}>{[basicInfo.gender, basicInfo.age ? `${basicInfo.age}岁` : ''].filter(Boolean).join(' · ')}</p>}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1" style={{ fontSize: `calc(${C.bodySize} - 2px)`, color: colorFor(fc.basicContact) }}>
            {basicInfo.email && <span className="inline-flex items-center gap-1"><Mail size={11} />{basicInfo.email}</span>}
            {basicInfo.phone && <span className="inline-flex items-center gap-1"><Phone size={11} />{basicInfo.phone}</span>}
            {basicInfo.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{basicInfo.location}</span>}
            {basicInfo.website && <span className="inline-flex items-center gap-1"><Globe size={11} />{basicInfo.website}</span>}
          </div>
        </div>
      </div>

      {/* 薄分界线（模块标题主题色控制） */}
      <div className="w-full h-px" style={{ backgroundColor: `${accentColor}20`, marginBottom: C.sectionSpacing }} />

      {basicInfo.summary && (
        <div data-pagination-block style={{ marginBottom: C.sectionSpacing }}>
          <ST color={accentColor} size={C.sectionTitleSize} fc={fc}>关于</ST>
          <div className="max-w-[85%]" style={{ color: colorFor(fc.basicSummary) }}>{renderRichText(basicInfo.summary)}</div>
        </div>
      )}

      {/* 动态模块顺序 */}
      {(sectionOrder || ['workExperience', 'internships', 'education', 'skills', 'projects', 'languages', 'certifications']).map((key) => (
        <React.Fragment key={key}>{renderMinimalSection(key, data, C, accentColor, fc)}</React.Fragment>
      ))}
    </div>
  );
}

function renderMinimalSection(key: SectionKey, data: ResumeData, C: any, accentColor: string, fc: any) {
  switch (key) {
    case 'workExperience': return data.workExperience.length > 0 ? <MinimalList title="经历" items={data.workExperience} C={C} accentColor={accentColor} fc={fc} isWork={true} /> : null;
    case 'internships': return data.internships.length > 0 ? <MinimalList title="实习" items={data.internships} C={C} accentColor={accentColor} fc={fc} isWork={false} /> : null;
    case 'education': return data.education.length > 0 ? <MinimalEdu items={data.education} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'skills': return data.skills.length > 0 ? <MinimalSkills items={data.skills} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'projects': return data.projects.length > 0 ? <MinimalProjects items={data.projects} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'languages': return data.languages.length > 0 ? <MinimalLangCert languages={data.languages} certifications={[]} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'certifications': return data.certifications.length > 0 && data.languages.length === 0 ? <MinimalLangCert languages={[]} certifications={data.certifications} C={C} accentColor={accentColor} fc={fc} /> : null;
    default: return null;
  }
}

function MinimalList({ title, items, C, accentColor, fc, isWork }: { title: string; items: (WorkExperience | Internship)[]; C: any; accentColor: string; fc: any; isWork: boolean }) {
  const companyColor = isWork ? colorFor(fc.workCompany) : colorFor(fc.internCompany);
  const posColor = isWork ? colorFor(fc.workPosition) : colorFor(fc.internPosition);
  const dateColor = isWork ? colorFor(fc.workDate) : colorFor(fc.internDate);
  const descColor = isWork ? colorFor(fc.workDesc) : colorFor(fc.internDesc);
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <ST color={accentColor} size={C.sectionTitleSize} fc={fc}>{title}</ST>
      {items.map((item, idx) => (
        <div key={item.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <span className="font-semibold" style={{ color: companyColor }}>{item.company}</span>
              {item.position && <span className="font-semibold" style={{ color: posColor, marginLeft: '2em' }}>{item.position}</span>}
            </div>
            <span style={{ color: dateColor, fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(item.startDate)} – {'current' in item && item.current ? '至今' : fmtDate(item.endDate)}</span>
          </div>
          {item.description && <div style={{ color: descColor }}>{renderRichText(item.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function MinimalEdu({ items, C, accentColor, fc }: { items: Education[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <ST color={accentColor} size={C.sectionTitleSize} fc={fc}>教育</ST>
      {items.map((edu, idx) => (
        <div key={edu.id} data-pagination-block className="flex justify-between items-baseline" style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div><span className="font-semibold" style={{ color: colorFor(fc.eduSchool) }}>{edu.school}{edu.level ? `（${edu.level}）` : ''}</span>
            {edu.field && <span style={{ color: colorFor(fc.eduDetail) }}> · {edu.field}</span>}{edu.degree && <span style={{ color: colorFor(fc.eduDetail) }}> · {edu.degree}</span>}{edu.lab && <span style={{ color: colorFor(fc.eduDetail) }}> · {edu.lab}</span>}
          </div>
          <span style={{ color: colorFor(fc.eduDate), fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(edu.startDate)} – {fmtDate(edu.endDate)}</span>
        </div>
      ))}
    </div>
  );
}

function MinimalSkills({ items, C, accentColor, fc }: { items: Skill[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <ST color={accentColor} size={C.sectionTitleSize} fc={fc}>技能</ST>
      <div className="flex flex-wrap gap-3">
        {items.map((skill) => (
          <span key={skill.id} style={{ fontSize: C.bodySize, color: colorFor(fc.skillName) }}>{skill.name}<span className="ml-1.5" style={{ fontSize: `calc(${C.bodySize} - 2px)`, color: colorFor(fc.skillLevel) }}>{'■'.repeat(skill.level)}{'□'.repeat(5 - skill.level)}</span></span>
        ))}
      </div>
    </div>
  );
}

function MinimalProjects({ items, C, accentColor, fc }: { items: Project[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <ST color={accentColor} size={C.sectionTitleSize} fc={fc}>项目</ST>
      {items.map((proj, idx) => (
        <div key={proj.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="flex justify-between items-baseline mb-1">
            <div>
              <span className="font-semibold" style={{ color: colorFor(fc.projName) }}>{proj.name}</span>
              {proj.technologies && <span className="font-semibold" style={{ color: colorFor(fc.projTech), marginLeft: proj.name ? '2em' : '0' }}>{proj.technologies}</span>}
            </div>
            {proj.link && <span className="font-normal" style={{ color: colorFor(fc.projLink), fontSize: `calc(${C.bodySize} - 2px)` }}>{proj.link}</span>}
          </div>
          {proj.description && <div style={{ color: colorFor(fc.projDesc) }}>{renderRichText(proj.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function MinimalLangCert({ languages, certifications, C, accentColor, fc }: { languages: Language[]; certifications: Certification[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <div className="flex gap-16">
        {languages.length > 0 && <div><ST color={accentColor} size={C.sectionTitleSize} fc={fc}>语言</ST>{languages.map((l, idx) => <p key={l.id} style={{ fontSize: C.bodySize, color: colorFor(fc.langName), ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>{l.name} — <span style={{ color: colorFor(fc.langProf) }}>{l.proficiency}</span></p>)}</div>}
        {certifications.length > 0 && <div><ST color={accentColor} size={C.sectionTitleSize} fc={fc}>证书</ST>{certifications.map((c, idx) => <p key={c.id} style={{ fontSize: C.bodySize, color: colorFor(fc.certName), ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>{c.name}{c.issuer && <span style={{ color: colorFor(fc.certIssuer) }}> · {c.issuer}</span>}{c.date && <span style={{ color: colorFor(fc.certDate) }}> · {fmtDate(c.date)}</span>}</p>)}</div>}
      </div>
    </div>
  );
}

function ST({ children, color, size, fc }: { children: React.ReactNode; color: string; size: string; fc: any }) {
  return <h2 className="font-bold uppercase tracking-[4px] pb-0.5 border-b-[1.2px] mb-1" style={{ color, fontSize: size, borderColor: color }}>{children}</h2>;
}

function fmtDate(d: string) { if (!d) return ''; return d.replace(/-/g, '.'); }
