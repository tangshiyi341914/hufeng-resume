import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { TemplateType } from '../types/resume';
import { FileText, Layout, Sparkles, ArrowRight } from 'lucide-react';

const templates: { key: TemplateType; name: string; desc: string; icon: React.ReactNode; gradient: string; tag: string }[] = [
  { key: 'classic', name: '经典模板', desc: '传统上下布局，衬线字体排版，适合大多数求职场景', icon: <FileText size={36} />, gradient: 'from-blue-500 to-blue-700', tag: '通用' },
  { key: 'modern', name: '现代模板', desc: '左右分栏布局，侧边栏突出技能，适合技术类岗位', icon: <Layout size={36} />, gradient: 'from-blue-600 to-indigo-700', tag: '技术' },
  { key: 'minimal', name: '极简模板', desc: '大量留白与精确间距，极简美学，适合创意设计岗', icon: <Sparkles size={36} />, gradient: 'from-sky-500 to-blue-600', tag: '创意' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setTemplate, resetResume } = useResumeStore();

  const handleSelect = (template: TemplateType) => {
    resetResume();
    setTemplate(template);
    navigate('/editor');
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs text-white/85 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
            3 款专业模板 · 实时预览 · 一键导出 PDF
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            制作一份<span className="text-blue-200">出众</span>的简历
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            选择模板，填写信息，实时预览效果。让你的简历在众多求职者中脱颖而出。
          </p>
        </div>
      </div>

      {/* 模板卡片 */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {templates.map(({ key, name, desc, icon, gradient, tag }) => (
            <div
              key={key}
              onClick={() => handleSelect(key)}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center text-white/90 relative overflow-hidden`}>
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 bg-white/15 rounded text-[10px] font-medium text-white/80">{tag}</span>
                </div>
                {icon}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 mb-1.5 text-base">{name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                  使用此模板 <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
