import React from 'react';
import { ResumeData, ResumeConfig, Skill, Research, Language, Certification, WorkExperience, Internship, Education, Project } from '../../types/resume';
import { applyConfig, renderRichText, colorFor } from '../../utils/resumeConfig';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

type SectionKey = 'workExperience' | 'internships' | 'education' | 'skills' | 'research' | 'projects' | 'languages' | 'certifications';

interface Props { data: ResumeData; config: ResumeConfig; sectionOrder: SectionKey[]; }

export default function ModernTemplate({ data, config, sectionOrder }: Props) {
  const { basicInfo } = data;
  const hasAny = basicInfo.fullName || data.workExperience.length > 0 || data.education.length > 0;
  const C = applyConfig(config);
  const sidebarBg = '#1e3a5f';
  const accentColor = C.themeColor;
  const fc = config.fieldColors;

  if (!hasAny) {
    return <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2"><span className="text-4xl">📄</span><p className="text-sm">在左侧填写信息，预览实时更新</p></div>;
  }

  // 将技能、语言、证书抽到侧边栏（不受 sectionOrder 影响）
  const safeOrder = sectionOrder || ['workExperience', 'internships', 'education', 'skills', 'projects', 'languages', 'certifications'];
  const mainOrder = safeOrder.filter((k) => k !== 'skills' && k !== 'languages' && k !== 'certifications');

  return (
    <div className="flex min-h-full" style={{ fontFamily: `'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif`, fontSize: C.bodySize, lineHeight: C.lineHeight }}>
      {/* 侧边栏 */}
      <div className="w-[35%] text-white flex-shrink-0" style={{ backgroundColor: sidebarBg, paddingTop: C.pageMarginY, paddingBottom: C.pageMarginY, paddingLeft: C.pageMarginX, paddingRight: C.pageMarginX }}>
        {basicInfo.photo && <div className="mb-3 flex justify-center"><img src={basicInfo.photo} alt="照片" className="w-28 h-36 object-cover border-2 border-white/20" /></div>}
        {basicInfo.fullName && (
          <div data-pagination-block className="mb-4 text-center">
            <h1 className="font-bold tracking-wide mb-0.5" style={{ fontSize: C.nameSize, color: colorFor(fc.basicName) }}>{basicInfo.fullName}</h1>
            {basicInfo.title && <p className="text-white/60" style={{ fontSize: C.bodySize, color: colorFor(fc.basicTitle) }}>意向岗位：{basicInfo.title}</p>}
            {(basicInfo.gender || basicInfo.age) && <p className="text-white/40 mt-0.5" style={{ fontSize: `calc(${C.bodySize} - 2px)`, color: colorFor(fc.basicMeta) }}>{[basicInfo.gender, basicInfo.age ? `${basicInfo.age}岁` : ''].filter(Boolean).join(' · ')}</p>}
          </div>
        )}
        {(basicInfo.email || basicInfo.phone || basicInfo.location || basicInfo.website) && (
          <div data-pagination-block style={{ marginBottom: C.sectionSpacing }}>
            <SidebarTitle accentColor={accentColor}>联系方式</SidebarTitle>
            <div className="space-y-2 text-white/70" style={{ fontSize: C.bodySize, color: colorFor(fc.basicContact) }}>
              {basicInfo.email && <p className="flex items-center gap-1.5"><Mail size={11} />{basicInfo.email}</p>}
              {basicInfo.phone && <p className="flex items-center gap-1.5"><Phone size={11} />{basicInfo.phone}</p>}
              {basicInfo.location && <p className="flex items-center gap-1.5"><MapPin size={11} />{basicInfo.location}</p>}
              {basicInfo.website && <p className="flex items-center gap-1.5 truncate"><Globe size={11} />{basicInfo.website}</p>}
            </div>
          </div>
        )}
        {data.skills.length > 0 && <SideSkills skills={data.skills} C={C} accentColor={accentColor} fc={fc} />}
        {data.languages.length > 0 && (
          <div style={{ marginBottom: C.sectionSpacing }}><SidebarTitle accentColor={accentColor}>语言能力</SidebarTitle>
            {data.languages.map((l, idx) => <p key={l.id} className="text-white/70 mb-0.5" style={{ fontSize: C.bodySize, color: colorFor(fc.langName), ...(idx > 0 ? { borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: C.itemSpacing } : {}) }}>{l.name}: <span style={{ color: colorFor(fc.langProf) }}>{l.proficiency}</span></p>)}
          </div>
        )}
        {data.certifications.length > 0 && (
          <div><SidebarTitle accentColor={accentColor}>证书资质</SidebarTitle>
            {data.certifications.map((c, idx) => <p key={c.id} className="text-white/70 mb-1" style={{ fontSize: C.bodySize, color: colorFor(fc.certName), ...(idx > 0 ? { borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: C.itemSpacing } : {}) }}>{c.name}{c.issuer && <span className="text-white/40" style={{ color: colorFor(fc.certIssuer) }}> · {c.issuer}</span>}</p>)}
          </div>
        )}
      </div>

      {/* 右侧主内容 — 按 mainOrder 动态渲染 */}
      <div className="flex-1" style={{ paddingTop: C.pageMarginY, paddingBottom: C.pageMarginY, paddingLeft: C.pageMarginX, paddingRight: C.pageMarginX }}>
        {basicInfo.summary && (
          <div data-pagination-block style={{ marginBottom: C.sectionSpacing }}>
            <MainTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>个人简介</MainTitle>
            <div style={{ color: colorFor(fc.basicSummary) }}>{renderRichText(basicInfo.summary)}</div>
          </div>
        )}
        {mainOrder.map((key) => (
          <React.Fragment key={key}>{renderMainSection(key, data, C, accentColor, fc)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

function renderMainSection(key: SectionKey, data: ResumeData, C: any, accentColor: string, fc: any) {
  switch (key) {
    case 'workExperience': return data.workExperience.length > 0 ? <MainExpSection items={data.workExperience} C={C} accentColor={accentColor} fc={fc} title="工作经历" /> : null;
    case 'internships': return data.internships.length > 0 ? <MainExpSection items={data.internships} C={C} accentColor={accentColor} fc={fc} title="实习经历" /> : null;
    case 'education': return data.education.length > 0 ? <MainEduSection items={data.education} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'research': return data.research.length > 0 ? <MainResearchSection items={data.research} C={C} accentColor={accentColor} fc={fc} /> : null;
    case 'projects': return data.projects.length > 0 ? <MainProjSection items={data.projects} C={C} accentColor={accentColor} fc={fc} /> : null;
    default: return null;
  }
}

function MainExpSection({ items, C, accentColor, fc, title }: { items: (WorkExperience | Internship)[]; C: any; accentColor: string; fc: any; title: string }) {
  const isWork = title === '工作经历';
  const companyColor = isWork ? colorFor(fc.workCompany) : colorFor(fc.internCompany);
  const posColor = isWork ? colorFor(fc.workPosition) : colorFor(fc.internPosition);
  const dateColor = isWork ? colorFor(fc.workDate) : colorFor(fc.internDate);
  const descColor = isWork ? colorFor(fc.workDesc) : colorFor(fc.internDesc);
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <MainTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>{title}</MainTitle>
      {items.map((item, idx) => (
        <div key={item.id} data-pagination-block className="relative pl-3" style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, borderLeft: `2px solid ${accentColor}30`, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="mb-1">
            <h3 className="font-bold" style={{ color: companyColor }}>{item.company}</h3>
            <p style={{ color: posColor }}>
              <span className="font-bold" style={{ marginLeft: '2em', display: 'inline-block' }}>{item.position}</span>
              <span className="ml-4" style={{ color: dateColor, fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(item.startDate)} — {'current' in item && item.current ? '至今' : fmtDate(item.endDate)}</span>
            </p>
          </div>
          {item.description && <div style={{ color: descColor }}>{renderRichText(item.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function MainEduSection({ items, C, accentColor, fc }: { items: Education[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <MainTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>教育背景</MainTitle>
      {items.map((edu, idx) => (
        <div key={edu.id} data-pagination-block className="flex justify-between items-start" style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div><h3 className="font-bold" style={{ color: colorFor(fc.eduSchool) }}>{edu.school}{edu.level ? `（${edu.level}）` : ''}</h3>
            <p style={{ color: colorFor(fc.eduDetail) }}>{edu.field}{edu.degree ? ` · ${edu.degree}` : ''}{edu.lab ? ` · ${edu.lab}` : ''}</p>
          </div>
          <span className="whitespace-nowrap" style={{ color: colorFor(fc.eduDate), fontSize: `calc(${C.bodySize} - 2px)` }}>{fmtDate(edu.startDate)} — {fmtDate(edu.endDate)}</span>
        </div>
      ))}
    </div>
  );
}

function MainProjSection({ items, C, accentColor, fc }: { items: Project[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <MainTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>项目经历</MainTitle>
      {items.map((proj, idx) => (
        <div key={proj.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}) }}>
          <div className="flex justify-between items-baseline mb-1">
            <div>
              <span className="font-bold" style={{ color: colorFor(fc.projName) }}>{proj.name}</span>
              {proj.technologies && <span className="font-bold" style={{ color: colorFor(fc.projTech), marginLeft: proj.name ? '2em' : '0' }}>{proj.technologies}</span>}
            </div>
            {proj.link && <span className="font-normal" style={{ color: colorFor(fc.projLink), fontSize: `calc(${C.bodySize} - 2px)` }}>{proj.link}</span>}
          </div>
          {proj.description && <div style={{ color: colorFor(fc.projDesc) }}>{renderRichText(proj.description)}</div>}
        </div>
      ))}
    </div>
  );
}

function MainResearchSection({ items, C, accentColor, fc }: { items: Research[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <MainTitle color={accentColor} size={C.sectionTitleSize} fc={fc}>科研成果</MainTitle>
      {items.map((r, idx) => (
        r.description ? <div key={r.id} data-pagination-block style={{ marginBottom: idx === items.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid #e5e7eb', paddingTop: C.itemSpacing } : {}), fontSize: C.bodySize, color: colorFor(fc.researchDesc) }}>{renderRichText(r.description)}</div> : null
      ))}
    </div>
  );
}

function SideSkills({ skills, C, accentColor, fc }: { skills: Skill[]; C: any; accentColor: string; fc: any }) {
  return (
    <div style={{ marginBottom: C.sectionSpacing }}>
      <SidebarTitle accentColor={accentColor}>专业技能</SidebarTitle>
      {skills.map((skill, idx) => (
        skill.description ? <div key={skill.id} data-pagination-block style={{ marginBottom: idx === skills.length - 1 ? 0 : C.itemSpacing, ...(idx > 0 ? { borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: C.itemSpacing } : {}), fontSize: C.bodySize, color: colorFor(fc.skillDesc) }}>{renderRichText(skill.description)}</div> : null
      ))}
    </div>
  );
}

function SidebarTitle({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return <h3 className="text-[10px] font-bold uppercase tracking-[3px] pb-0.5 mb-1.5 border-b-[1.2px]" style={{ color: accentColor, borderColor: accentColor }}>{children}</h3>;
}

function MainTitle({ children, color, size, fc }: { children: React.ReactNode; color: string; size: string; fc: any }) {
  return <h2 className="font-bold uppercase tracking-[3px] pb-0.5 border-b-[1.2px] mb-1 flex items-center gap-2" style={{ color, fontSize: size, borderColor: color }}><span className="w-5 h-0.5 inline-block" style={{ backgroundColor: color }} />{children}</h2>;
}

function fmtDate(d: string) { if (!d) return ''; return d.replace(/-/g, '.'); }
