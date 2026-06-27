import React from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { TemplateType, textColorMap, textColorLabels, TextColorLevel, FieldColors } from '../../types/resume';
import { X, Type, AlignJustify, MoveVertical, Maximize, Layout, Minus, Plus, Palette, ChevronDown } from 'lucide-react';
import { SectionKey } from '../../types/resume';

interface Props { open: boolean; onClose: () => void; }

// 模块 → 颜色配置组的映射
const sectionColorGroups: Record<SectionKey, { title: string; fields: { key: keyof FieldColors; label: string }[] }> = {
  workExperience: { title: '工作经历', fields: [
    { key: 'workCompany', label: '公司名称' }, { key: 'workPosition', label: '职位' },
    { key: 'workDate', label: '日期' }, { key: 'workDesc', label: '描述' },
  ]},
  internships: { title: '实习经历', fields: [
    { key: 'internCompany', label: '公司名称' }, { key: 'internPosition', label: '实习职位' },
    { key: 'internDate', label: '日期' }, { key: 'internDesc', label: '描述' },
  ]},
  education: { title: '教育背景', fields: [
    { key: 'eduSchool', label: '学校' }, { key: 'eduDetail', label: '学位/专业/实验室' },
    { key: 'eduDate', label: '日期' },
  ]},
  skills: { title: '专业技能', fields: [
    { key: 'skillName', label: '技能名称' }, { key: 'skillLevel', label: '等级指示' },
  ]},
  projects: { title: '项目经历', fields: [
    { key: 'projName', label: '项目名称' }, { key: 'projLink', label: '项目链接' },
    { key: 'projTech', label: '技术栈' }, { key: 'projDesc', label: '描述' },
  ]},
  languages: { title: '语言能力', fields: [
    { key: 'langName', label: '语言名称' }, { key: 'langProf', label: '熟练度' },
  ]},
  certifications: { title: '证书资质', fields: [
    { key: 'certName', label: '证书名称' }, { key: 'certIssuer', label: '颁发机构' },
    { key: 'certDate', label: '日期' },
  ]},
};

export default function ResumeConfigPanel({ open, onClose }: Props) {
  const { currentResume, setTemplate, updateConfig } = useResumeStore();
  const { config, template, sectionOrder } = currentResume;
  if (!open) return null;

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const updateFieldColor = (key: keyof FieldColors, value: TextColorLevel) => {
    updateConfig({ fieldColors: { ...config.fieldColors, [key]: value } });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-96 bg-white h-full shadow-2xl border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-800 text-base">简历配置</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-5">

          {/* ===== 排版 ===== */}
          <SectionHeader icon={<Layout size={15} />} title="排版设置" />

          {/* 模板选择 */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-500">
              <Layout size={15} /><span className="text-xs font-semibold uppercase tracking-wider">模板选择</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['classic', 'modern', 'minimal'] as TemplateType[]).map((t) => (
                <button key={t} onClick={() => setTemplate(t)}
                  className={`py-2 text-xs font-medium rounded-md border transition-all ${template === t ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                  {{ classic: '经典', modern: '现代', minimal: '极简' }[t]}
                </button>
              ))}
            </div>
          </div>

          {/* 主题色 */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-500"><Palette size={15} /><span className="text-xs font-semibold uppercase tracking-wider">主题色</span></div>
            <div className="flex items-center gap-2">
              <input type="color" value={config.themeColor} onChange={(e) => updateConfig({ themeColor: e.target.value })}
                className="w-10 h-10 rounded-md border border-gray-200 cursor-pointer p-1" />
              <input type="text" value={config.themeColor}
                onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateConfig({ themeColor: v }); }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>

          <NumberSetting icon={<Type size={15} />} label="姓名字号 (px)" value={config.nameSize} min={16} max={48} step={1}
            onChange={(v) => updateConfig({ nameSize: clamp(v, 16, 48) })} />
          <NumberSetting icon={<Type size={15} />} label="模块标题字号 (px)" value={config.sectionTitleSize} min={8} max={24} step={1}
            onChange={(v) => updateConfig({ sectionTitleSize: clamp(v, 8, 24) })} />
          <NumberSetting icon={<Type size={15} />} label="正文字号 (px)" value={config.bodySize} min={8} max={24} step={1}
            onChange={(v) => updateConfig({ bodySize: clamp(v, 8, 24) })} />
          <NumberSetting icon={<AlignJustify size={15} />} label="行高" value={config.lineHeight} min={1.0} max={3.0} step={0.1}
            onChange={(v) => updateConfig({ lineHeight: clamp(v, 1.0, 3.0) })} />
          <NumberSetting icon={<MoveVertical size={15} />} label="模块间距 (px)" value={config.sectionSpacing} min={2} max={80} step={2}
            onChange={(v) => updateConfig({ sectionSpacing: clamp(v, 2, 80) })} />
          <NumberSetting icon={<MoveVertical size={15} />} label="项间距 (px)" value={config.itemSpacing} min={2} max={48} step={2}
            onChange={(v) => updateConfig({ itemSpacing: clamp(v, 2, 48) })} />
          <NumberSetting icon={<Maximize size={15} />} label="左右页边距 (px)" value={config.pageMarginX} min={12} max={72} step={2}
            onChange={(v) => updateConfig({ pageMarginX: clamp(v, 12, 72) })} />
          <NumberSetting icon={<Maximize size={15} />} label="上下页边距 (px)" value={config.pageMarginY} min={12} max={72} step={2}
            onChange={(v) => updateConfig({ pageMarginY: clamp(v, 12, 72) })} />

          {/* ===== 文字颜色 ===== */}
          <SectionHeader icon={<Palette size={15} />} title="文字颜色" />
          <p className="text-[10px] text-gray-400 -mt-3 -mb-2">为每个模块的每个字段单独设置颜色</p>

          {/* 基本信息颜色 — 永远在最前面 */}
          <FieldColorGroup title="基本信息" fields={[
            { key: 'basicName', label: '姓名' },
            { key: 'basicTitle', label: '意向岗位' },
            { key: 'basicMeta', label: '性别/年龄' },
            { key: 'basicContact', label: '联系方式' },
            { key: 'basicSummary', label: '个人简介' },
            { key: 'sectionTitle', label: '模块标题' },
          ]} value={config.fieldColors} onChange={updateFieldColor} />

          {/* 其余模块按 sectionOrder 动态排序 */}
          {sectionOrder.map((key) => {
            const cfg = sectionColorGroups[key];
            return cfg ? <FieldColorGroup key={key} title={cfg.title} fields={cfg.fields} value={config.fieldColors} onChange={updateFieldColor} /> : null;
          })}

          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}

// ====== 子组件 ======

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1 border-t border-gray-100">
      <span className="text-gray-500">{icon}</span>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
  );
}

function FieldColorGroup({ title, fields, value, onChange }: {
  title: string;
  fields: { key: keyof FieldColors; label: string }[];
  value: FieldColors;
  onChange: (key: keyof FieldColors, v: TextColorLevel) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const colorLevels: TextColorLevel[] = ['gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900'];

  return (
    <div className="border border-gray-150 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-xs font-medium text-gray-600">{title}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 py-2.5 space-y-2.5 bg-white">
          {fields.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500 flex-1">{label}</span>
              <div className="flex items-center gap-0.5">
                {colorLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => onChange(key, level)}
                    className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: textColorMap[level],
                      borderColor: value[key] === level ? '#3b82f6' : 'transparent',
                      boxShadow: value[key] === level ? `0 0 0 1px #3b82f6` : 'none',
                    }}
                    title={textColorLabels[level]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberSetting({ icon, label, value, min, max, step, onChange }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-gray-500">{icon}<span className="text-xs font-semibold uppercase tracking-wider">{label}</span></div>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(value - step)} disabled={value <= min}
          className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Minus size={14} /></button>
        <input type="number" value={step < 1 ? value.toFixed(1) : value} min={min} max={max} step={step}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
          className="w-20 text-center text-sm font-medium border border-gray-200 rounded-md py-2 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 text-gray-700" />
        <button onClick={() => onChange(value + step)} disabled={value >= max}
          className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus size={14} /></button>
      </div>
    </div>
  );
}
