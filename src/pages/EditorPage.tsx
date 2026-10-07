import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { exportToPDF } from '../utils/exportPdf';
import ResumeForm from '../components/ResumeForm/ResumeForm';
import ResumePreview from '../components/ResumePreview/ResumePreview';
import ResumeConfigPanel from '../components/ResumeConfig/ResumeConfig';
import { ArrowLeft, Download, Save, Eye, Edit3, Loader2, Check, Settings } from 'lucide-react';

// 停笔多久后自动保存（防抖）：每次编辑都会重新计时
const AUTO_SAVE_DELAY_MS = 5000;

export default function EditorPage() {
  const navigate = useNavigate();
  const { currentResume, setTitle, saveResume, saving, dirty } = useResumeStore();
  const [showPreview, setShowPreview] = useState(true);
  const [msg, setMsg] = useState('');
  const [configOpen, setConfigOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [autoSaveFailed, setAutoSaveFailed] = useState(false);

  const timeLabel = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

  // 自动保存：dirty 后停笔 5 秒触发；每次编辑（currentResume 变化）都会重置计时器。
  // saving 期间不重开计时器，避免并发保存互相覆盖。
  useEffect(() => {
    if (!dirty || saving) return;
    const timer = setTimeout(async () => {
      const result = await saveResume();
      setLastSavedAt(result ? timeLabel() : '');
      setAutoSaveFailed(!result);
    }, AUTO_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [dirty, saving, currentResume, saveResume]);

  // 离开编辑器（返回/切换页面）时立刻补一次保存，避免最后一笔修改还在 5 秒防抖窗口里就被丢掉。
  // 直接读 store 快照，避免闭包拿到过期的 dirty/saving。
  useEffect(() => () => {
    const { dirty, saving, saveResume: save } = useResumeStore.getState();
    if (dirty && !saving) void save();
  }, []);

  const handleSave = async () => {
    const result = await saveResume();
    if (result) {
      setLastSavedAt(timeLabel());
      setAutoSaveFailed(false);
      setMsg('保存成功');
      setTimeout(() => setMsg(''), 2000);
    } else {
      setMsg('保存失败，请重试');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleExport = () => {
    exportToPDF('resume-preview', `${currentResume.title || '简历'}.pdf`);
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={currentResume.title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-semibold text-gray-700 border border-transparent hover:border-gray-300 focus:border-primary rounded-md px-3 py-1.5 outline-none transition-colors w-44 bg-transparent"
              placeholder="简历标题"
            />
            <button
              onClick={() => setConfigOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings size={14} />
              配置
            </button>
            {saving ? (
              <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                <Loader2 size={12} className="animate-spin" />
                保存中
              </span>
            ) : dirty ? (
              <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap" title={`修改后 ${AUTO_SAVE_DELAY_MS / 1000} 秒自动保存`}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
                未保存
              </span>
            ) : autoSaveFailed ? (
              <span className="text-xs text-red-500 whitespace-nowrap" title="自动保存失败，请检查后端服务是否正常">自动保存失败</span>
            ) : lastSavedAt ? (
              <span className="text-xs text-gray-400 whitespace-nowrap">已保存 {lastSavedAt}</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">

          {/* 预览切换 */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              showPreview
                ? 'bg-primary-pale text-primary border border-primary/20'
                : 'text-gray-500 hover:bg-gray-100 border border-transparent'
            }`}
          >
            {showPreview ? <Eye size={16} /> : <Edit3 size={16} />}
            {showPreview ? '预览中' : '编辑'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm shadow-primary/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            保存
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors shadow-sm"
          >
            <Download size={16} />
            导出 PDF
          </button>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center justify-center gap-1.5 py-2 text-sm font-medium ${
          msg.includes('成功') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          {msg.includes('成功') && <Check size={14} />}
          {msg}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className={`overflow-y-auto p-5 ${showPreview ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
          <ResumeForm />
          <div className="h-8" />
        </div>
        {showPreview && (
          <div className="w-1/2 bg-gray-100 overflow-y-auto p-5 border-l border-gray-200">
            <ResumePreview />
          </div>
        )}
      </div>

      {/* 简历配置侧边栏 */}
      <ResumeConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
}
