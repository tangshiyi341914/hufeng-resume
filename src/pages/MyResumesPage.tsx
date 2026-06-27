import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Resume } from '../types/resume';
import * as api from '../api';
import { useResumeStore } from '../store/resumeStore';
import { FileText, Trash2, Edit3, Plus, Calendar, Clock } from 'lucide-react';

export default function MyResumesPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const loadResume = useResumeStore((s) => s.loadResume);
  const resetResume = useResumeStore((s) => s.resetResume);

  const fetchResumes = async () => {
    setLoading(true);
    try { setResumes(await api.getResumes()); }
    catch (err) { console.error('获取列表失败:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleEdit = (resume: Resume) => { loadResume(resume); navigate('/editor'); };
  const handleCreate = () => { resetResume(); navigate('/editor'); };
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这份简历吗？')) return;
    try { await api.deleteResume(id); setResumes((p) => p.filter((r) => r.id !== id)); }
    catch { alert('删除失败'); }
  };

  const tplNames: Record<string, string> = { classic: '经典模板', modern: '现代模板', minimal: '极简模板' };
  const tplBars: Record<string, string> = { classic: 'bg-blue-500', modern: 'bg-blue-600', minimal: 'bg-sky-500' };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的简历</h1>
          <p className="text-gray-500 text-sm mt-1.5">管理和编辑您创建的所有简历</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm shadow-sm shadow-primary/20"
        >
          <Plus size={18} /> 创建新简历
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-primary-pale rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText size={28} className="text-primary" />
          </div>
          <p className="text-gray-700 font-semibold mb-2">还没有简历</p>
          <p className="text-gray-400 text-sm mb-6">创建您的第一份专业简历，开始求职之旅</p>
          <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm">
            开始创建
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onClick={() => handleEdit(resume)}
            >
              <div className={`h-1 ${tplBars[resume.template] || 'bg-blue-500'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate mb-1">{resume.title || '未命名简历'}</h3>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-500">
                      {tplNames[resume.template] || resume.template}
                    </span>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEdit(resume)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-pale rounded-md transition-colors" title="编辑">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(resume.id!)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="删除">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  {resume.createdAt && (
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(resume.createdAt).toLocaleDateString('zh-CN')}</span>
                  )}
                  {resume.updatedAt && resume.updatedAt !== resume.createdAt && (
                    <span className="flex items-center gap-1"><Clock size={11} />已更新</span>
                  )}
                </div>
                {resume.data?.basicInfo && (
                  <div className="pt-3 border-t border-gray-100">
                    {resume.data.basicInfo.fullName && (
                      <p className="text-sm text-gray-700 font-medium">
                        {resume.data.basicInfo.fullName}
                        {resume.data.basicInfo.title && <span className="text-gray-400 font-normal"> · {resume.data.basicInfo.title}</span>}
                      </p>
                    )}
                    {(resume.data.workExperience?.length > 0 || resume.data.internships?.length > 0) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {resume.data.workExperience.length > 0 && `${resume.data.workExperience.length} 段工作经历`}
                        {resume.data.workExperience.length > 0 && resume.data.internships.length > 0 && ' · '}
                        {resume.data.internships.length > 0 && `${resume.data.internships.length} 段实习`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
