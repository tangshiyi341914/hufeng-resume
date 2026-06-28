import React, { useState, useRef, useCallback } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { ChevronDown, Plus, Trash2, Camera, GripVertical } from 'lucide-react';
import DatePicker from '../DatePicker/DatePicker';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ==================== 可拖拽包装器 ====================
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
    </div>
  );
}

function DragHandle({ listeners }: { listeners: Record<string, Function> }) {
  return (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors p-0.5"
      {...listeners}
    >
      <GripVertical size={16} />
    </button>
  );
}

// ==================== 可折叠区域 ====================
function SectionBlock({
  id,
  title,
  count,
  children,
  defaultOpen = true,
  onAdd,
  dragHandle,
}: {
  id: string;
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAdd?: () => void;
  dragHandle?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg bg-white mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2.5">
          {dragHandle}
          <span className="text-gray-400 transition-transform duration-200" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}><ChevronDown size={16} /></span>
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          {count !== undefined && count > 0 && <span className="px-1.5 py-0.5 bg-primary-pale text-primary text-[11px] font-medium rounded">{count}</span>}
        </div>
        {onAdd && (
          <button onClick={(e) => { e.stopPropagation(); onAdd(); setOpen(true); }} className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary hover:bg-primary-pale rounded-md transition-colors">
            <Plus size={13} /> 添加
          </button>
        )}
      </div>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

// ==================== 通用控件 ====================
function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <div className={span ? 'col-span-2' : ''}><label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>{children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-shadow bg-white" />;
}

function BoldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modifyTextarea = (fn: (ta: HTMLTextAreaElement) => void) => {
    const ta = textareaRef.current;
    if (!ta) return;
    fn(ta);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
  };

  const setNativeValue = (ta: HTMLTextAreaElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(ta, value);
  };

  const insertBold = () => modifyTextarea((ta) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const sel = text.substring(start, end) || '加粗文字';
    // 检查选中文本前/后是否已有 ** 标记（toggle 取消）
    const before = text.substring(Math.max(0, start - 2), start);
    const after = text.substring(end, Math.min(text.length, end + 2));
    if (before === '**' && after === '**') {
      // 取消加粗：去掉外围 **...**
      const newText = text.substring(0, start - 2) + sel + text.substring(end + 2);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start - 2, start - 2 + sel.length);
    } else if (sel.startsWith('**') && sel.endsWith('**') && sel.length >= 4) {
      // 选中文本本身带 **，去掉
      const inner = sel.slice(2, -2);
      const newText = text.substring(0, start) + inner + text.substring(end);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start, start + inner.length);
    } else {
      // 加粗：添加 **...**
      const newText = text.substring(0, start) + `**${sel}**` + text.substring(end);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start + 2, start + 2 + sel.length);
    }
  });

  const insertUnorderedList = () => modifyTextarea((ta) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const sel = text.substring(start, end) || '列表项';
    const lines = sel.split('\n');
    // 如果所有选中行都已带标记 → toggle 取消
    const allBulleted = lines.every((l) => /^[-*]\s/.test(l));
    if (allBulleted) {
      const cleaned = lines.map((l) => l.replace(/^[-*]\s+/, '')).join('\n');
      const newText = text.substring(0, start) + cleaned + text.substring(end);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start, start + cleaned.length);
    } else {
      const bulleted = lines.map((l) => `- ${l}`).join('\n');
      const newText = text.substring(0, start) + bulleted + text.substring(end);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start, start + bulleted.length);
    }
  });

  const insertOrderedList = () => modifyTextarea((ta) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const sel = text.substring(start, end) || '列表项';
    const lines = sel.split('\n');
    // 如果所有选中行都已带编号 → toggle 取消
    const allNumbered = lines.every((l) => /^\d+[.\)]\s/.test(l));
    if (allNumbered) {
      const cleaned = lines.map((l) => l.replace(/^\d+[.\)]\s+/, '')).join('\n');
      const newText = text.substring(0, start) + cleaned + text.substring(end);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start, start + cleaned.length);
    } else {
      const numbered = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
      const newText = text.substring(0, start) + numbered + text.substring(end);
      setNativeValue(ta, newText);
      ta.setSelectionRange(start, start + numbered.length);
    }
  });

  return (
    <div className="relative">
      <textarea ref={textareaRef} {...props} className="w-full px-3 py-2 pb-8 border border-gray-200 rounded-md text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-shadow resize-none bg-white" />
      <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
        <button type="button" onClick={insertBold} className="px-2 py-0.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><strong>B</strong> 加粗</button>
        <span className="text-gray-300 mx-0.5">|</span>
        <button type="button" onClick={insertUnorderedList} className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="无序列表"><span className="font-bold">≡</span> 无序</button>
        <button type="button" onClick={insertOrderedList} className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="有序列表"><span className="font-bold">1.</span> 有序</button>
        <span className="text-[10px] text-gray-300 ml-1">**加粗** / - 无序 / 1. 有序</span>
      </div>
    </div>
  );
}

// ==================== 可拖拽列表项卡片 ====================
function ListItemCard({ id, label, onRemove, children }: { id: string; label: string; onRemove: () => void; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DragHandle listeners={listeners} />
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        </div>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors p-0.5"><Trash2 size={14} /></button>
      </div>
      {children}
    </div>
  );
}

// ==================== 基本信息 ====================
function BasicInfoForm() {
  const { currentResume, updateBasicInfo } = useResumeStore();
  const { basicInfo } = currentResume.data;
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateBasicInfo({ photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const fullWidth = ['fullName', 'title'];
  const halfFields = [
    { key: 'gender', label: '性别', placeholder: '男 / 女' },
    { key: 'age', label: '年龄', placeholder: '如：25' },
    { key: 'email', label: '邮箱', placeholder: 'example@email.com' },
    { key: 'phone', label: '电话', placeholder: '请输入电话号码' },
    { key: 'location', label: '所在地', placeholder: '如：北京市' },
    { key: 'website', label: '个人网站', placeholder: 'https://your-site.com' },
  ];

  return (
    <SectionBlock id="basicInfo" title="基本信息">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-md overflow-hidden cursor-pointer hover:border-primary/50 relative group bg-gray-50 transition-colors" onClick={() => fileRef.current?.click()}>
            {basicInfo.photo ? (
              <>
                <img src={basicInfo.photo} alt="照片" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={16} className="text-white" /></div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400"><Camera size={20} /><span className="text-[9px] mt-1">照片</span></div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>
        <div className="flex-1 space-y-2">
          {/* 姓名 + 意向岗位 独占一行 */}
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">姓名</label>
            <Input value={basicInfo.fullName} onChange={(e) => updateBasicInfo({ fullName: e.target.value })} placeholder="请输入姓名" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">意向岗位</label>
            <Input value={basicInfo.title} onChange={(e) => updateBasicInfo({ title: e.target.value })} placeholder="如：高级前端工程师" />
          </div>
          {/* 其他字段 3 列 */}
          <div className="grid grid-cols-3 gap-2">
            {halfFields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</label>
                <Input value={(basicInfo as any)[key]} onChange={(e) => updateBasicInfo({ [key]: e.target.value })} placeholder={placeholder} />
              </div>
            ))}
          </div>
          {/* 个人简介 */}
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">个人简介</label>
            <BoldTextarea value={basicInfo.summary} onChange={(e) => updateBasicInfo({ summary: e.target.value })} placeholder="简要描述您的职业背景、核心能力和求职目标..." rows={4} />
          </div>
        </div>
      </div>
    </SectionBlock>
  );
}

// ==================== 工作经历 ====================
function WorkExperienceForm() {
  const { currentResume, addWorkExperience, updateWorkExperience, removeWorkExperience, reorderWorkExperience } = useResumeStore();
  const { workExperience } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = workExperience.findIndex((x) => x.id === active.id);
      const to = workExperience.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderWorkExperience(from, to);
    }
  };

  return (
    <SectionBlock id="workExperience" title="工作经历" count={workExperience.length} onAdd={addWorkExperience}>
      {workExperience.length === 0 && <EmptyHint text="添加您的工作经历" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={workExperience.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {workExperience.map((exp, i) => (
            <ListItemCard key={exp.id} id={exp.id} label={`工作经历 #${i + 1}`} onRemove={() => removeWorkExperience(exp.id)}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="公司名称"><Input value={exp.company} onChange={(e) => updateWorkExperience(exp.id, { company: e.target.value })} placeholder="公司名称" /></Field>
                <Field label="职位"><Input value={exp.position} onChange={(e) => updateWorkExperience(exp.id, { position: e.target.value })} placeholder="职位名称" /></Field>
                <Field label="开始日期"><DatePicker value={exp.startDate} onChange={(v) => updateWorkExperience(exp.id, { startDate: v })} /></Field>
                <Field label="结束日期">
                  <div className="flex items-center gap-2">
                    <div className="flex-1"><DatePicker value={exp.current ? '' : exp.endDate} onChange={(v) => updateWorkExperience(exp.id, { endDate: v })} /></div>
                    <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateWorkExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} className="accent-primary" /> 至今
                    </label>
                  </div>
                </Field>
                <Field label="工作描述" span><BoldTextarea value={exp.description} onChange={(e) => updateWorkExperience(exp.id, { description: e.target.value })} placeholder="描述您的主要职责和工作成果..." rows={6} /></Field>
              </div>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 实习经历 ====================
function InternshipForm() {
  const { currentResume, addInternship, updateInternship, removeInternship, reorderInternships } = useResumeStore();
  const { internships } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = internships.findIndex((x) => x.id === active.id);
      const to = internships.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderInternships(from, to);
    }
  };

  return (
    <SectionBlock id="internships" title="实习经历" count={internships.length} onAdd={addInternship}>
      {internships.length === 0 && <EmptyHint text="添加您的实习经历" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={internships.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {internships.map((intern, i) => (
            <ListItemCard key={intern.id} id={intern.id} label={`实习经历 #${i + 1}`} onRemove={() => removeInternship(intern.id)}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="公司名称"><Input value={intern.company} onChange={(e) => updateInternship(intern.id, { company: e.target.value })} placeholder="公司名称" /></Field>
                <Field label="实习职位"><Input value={intern.position} onChange={(e) => updateInternship(intern.id, { position: e.target.value })} placeholder="实习职位" /></Field>
                <Field label="开始日期"><DatePicker value={intern.startDate} onChange={(v) => updateInternship(intern.id, { startDate: v })} /></Field>
                <Field label="结束日期"><DatePicker value={intern.endDate} onChange={(v) => updateInternship(intern.id, { endDate: v })} /></Field>
                <Field label="实习描述" span><BoldTextarea value={intern.description} onChange={(e) => updateInternship(intern.id, { description: e.target.value })} placeholder="描述实习期间的工作内容和收获..." rows={6} /></Field>
              </div>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 教育背景 ====================
function EducationForm() {
  const { currentResume, addEducation, updateEducation, removeEducation, reorderEducation } = useResumeStore();
  const { education } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const schoolLevels = ['', '985', '211', '双一流', '一本', '二本', '专科'];

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = education.findIndex((x) => x.id === active.id);
      const to = education.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderEducation(from, to);
    }
  };

  return (
    <SectionBlock id="education" title="教育背景" count={education.length} onAdd={addEducation}>
      {education.length === 0 && <EmptyHint text="添加您的教育经历" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={education.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {education.map((edu, i) => (
            <ListItemCard key={edu.id} id={edu.id} label={`教育背景 #${i + 1}`} onRemove={() => removeEducation(edu.id)}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="学校"><Input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} placeholder="学校名称" /></Field>
                <Field label="学校等级">
                  <select value={edu.level} onChange={(e) => updateEducation(edu.id, { level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 bg-white">
                    <option value="">无</option>
                    {schoolLevels.filter(l => l).map((l) => (<option key={l} value={l}>{l}</option>))}
                  </select>
                </Field>
                <Field label="学位"><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="本科 / 硕士" /></Field>
                <Field label="专业"><Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} placeholder="专业名称" /></Field>
                <div className="flex gap-2">
                  <div className="flex-1"><label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">开始</label><DatePicker value={edu.startDate} onChange={(v) => updateEducation(edu.id, { startDate: v })} /></div>
                  <div className="flex-1"><label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">结束</label><DatePicker value={edu.endDate} onChange={(v) => updateEducation(edu.id, { endDate: v })} /></div>
                </div>
                <Field label="实验室（选填）"><Input value={edu.lab} onChange={(e) => updateEducation(edu.id, { lab: e.target.value })} placeholder="如：XXX重点实验室" /></Field>
              </div>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 技能 ====================
function SkillsForm() {
  const { currentResume, addSkill, updateSkill, removeSkill, reorderSkills } = useResumeStore();
  const { skills } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = skills.findIndex((x) => x.id === active.id);
      const to = skills.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderSkills(from, to);
    }
  };

  return (
    <SectionBlock id="skills" title="专业技能" count={skills.length} onAdd={addSkill}>
      {skills.length === 0 && <EmptyHint text="添加您的专业技能" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={skills.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {skills.map((skill, i) => (
            <ListItemCard key={skill.id} id={skill.id} label={`技能 #${i + 1}`} onRemove={() => removeSkill(skill.id)}>
              <Field label="技能描述" span><BoldTextarea value={skill.description} onChange={(e) => updateSkill(skill.id, { description: e.target.value })} placeholder="描述您对该技能的掌握程度和应用场景..." rows={4} /></Field>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 科研成果 ====================
function ResearchForm() {
  const { currentResume, addResearch, updateResearch, removeResearch, reorderResearch } = useResumeStore();
  const { research } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = research.findIndex((x) => x.id === active.id);
      const to = research.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderResearch(from, to);
    }
  };

  return (
    <SectionBlock id="research" title="科研成果" count={research.length} onAdd={addResearch}>
      {research.length === 0 && <EmptyHint text="添加您的科研成果" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={research.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {research.map((r, i) => (
            <ListItemCard key={r.id} id={r.id} label={`科研成果 #${i + 1}`} onRemove={() => removeResearch(r.id)}>
              <Field label="成果描述" span><BoldTextarea value={r.description} onChange={(e) => updateResearch(r.id, { description: e.target.value })} placeholder="描述您的研究内容、发表论文、专利或参与项目..." rows={4} /></Field>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 项目经历 ====================
function ProjectsForm() {
  const { currentResume, addProject, updateProject, removeProject, reorderProjects } = useResumeStore();
  const { projects } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = projects.findIndex((x) => x.id === active.id);
      const to = projects.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderProjects(from, to);
    }
  };

  return (
    <SectionBlock id="projects" title="项目经历" count={projects.length} onAdd={addProject}>
      {projects.length === 0 && <EmptyHint text="添加您的项目经历" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={projects.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {projects.map((proj, i) => (
            <ListItemCard key={proj.id} id={proj.id} label={`项目 #${i + 1}`} onRemove={() => removeProject(proj.id)}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="项目名称"><Input value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="项目名称" /></Field>
                <Field label="项目链接"><Input value={proj.link} onChange={(e) => updateProject(proj.id, { link: e.target.value })} placeholder="https://..." /></Field>
                <Field label="技术栈" span><Input value={proj.technologies} onChange={(e) => updateProject(proj.id, { technologies: e.target.value })} placeholder="如：React, Node.js, MongoDB" /></Field>
                <Field label="项目描述" span><BoldTextarea value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} placeholder="描述项目的功能、您的角色和取得的成果..." rows={5} /></Field>
              </div>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 语言 ====================
function LanguagesForm() {
  const { currentResume, addLanguage, updateLanguage, removeLanguage, reorderLanguages } = useResumeStore();
  const { languages } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const levels = ['母语', '流利', '良好', '一般'];

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = languages.findIndex((x) => x.id === active.id);
      const to = languages.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderLanguages(from, to);
    }
  };

  return (
    <SectionBlock id="languages" title="语言能力" count={languages.length} onAdd={addLanguage}>
      {languages.length === 0 && <EmptyHint text="添加您的语言能力" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={languages.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {languages.map((lang) => (
            <ListItemCard key={lang.id} id={lang.id} label={lang.name || '新语言'} onRemove={() => removeLanguage(lang.id)}>
              <div className="flex items-center gap-3">
                <div className="flex-1"><Input value={lang.name} onChange={(e) => updateLanguage(lang.id, { name: e.target.value })} placeholder="语言名称" /></div>
                <select value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 bg-white flex-shrink-0">
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

// ==================== 证书 ====================
function CertificationsForm() {
  const { currentResume, addCertification, updateCertification, removeCertification, reorderCertifications } = useResumeStore();
  const { certifications } = currentResume.data;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = certifications.findIndex((x) => x.id === active.id);
      const to = certifications.findIndex((x) => x.id === over.id);
      if (from !== -1 && to !== -1) reorderCertifications(from, to);
    }
  };

  return (
    <SectionBlock id="certifications" title="证书与资质" count={certifications.length} onAdd={addCertification}>
      {certifications.length === 0 && <EmptyHint text="添加您的证书" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={certifications.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {certifications.map((cert) => (
            <ListItemCard key={cert.id} id={cert.id} label={cert.name || '新证书'} onRemove={() => removeCertification(cert.id)}>
              <div className="flex items-center gap-3">
                <div className="flex-1"><Input value={cert.name} onChange={(e) => updateCertification(cert.id, { name: e.target.value })} placeholder="证书名称" /></div>
                <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })} placeholder="颁发机构" />
                <div className="w-44 flex-shrink-0"><DatePicker value={cert.date} onChange={(v) => updateCertification(cert.id, { date: v })} /></div>
              </div>
            </ListItemCard>
          ))}
        </SortableContext>
      </DndContext>
    </SectionBlock>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-gray-300 text-sm text-center py-6">{text}，点击右上角"添加"按钮</p>;
}

// ==================== 模块排序（拖拽调整模块顺序） ====================
type SectionKey = 'workExperience' | 'internships' | 'education' | 'skills' | 'research' | 'projects' | 'languages' | 'certifications';

const sectionMap: Record<SectionKey, { component: React.FC; title: string }> = {
  workExperience: { component: WorkExperienceForm, title: '工作经历' },
  internships: { component: InternshipForm, title: '实习经历' },
  education: { component: EducationForm, title: '教育背景' },
  skills: { component: SkillsForm, title: '专业技能' },
  research: { component: ResearchForm, title: '科研成果' },
  projects: { component: ProjectsForm, title: '项目经历' },
  languages: { component: LanguagesForm, title: '语言能力' },
  certifications: { component: CertificationsForm, title: '证书与资质' },
};

function SortableSectionWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center">
        <div className="flex-shrink-0 ml-1 -mr-1 z-10">
          <DragHandle listeners={listeners} />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

// ==================== 主表单 ====================
export default function ResumeForm() {
  const sectionOrder = useResumeStore((s) => s.currentResume.sectionOrder);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleSectionDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id && sectionOrder) {
      const from = sectionOrder.indexOf(active.id as SectionKey);
      const to = sectionOrder.indexOf(over.id as SectionKey);
      if (from !== -1 && to !== -1) reorderSections(from, to);
    }
  }, [sectionOrder, reorderSections]);

  return (
    <div className="space-y-2">
      {/* 基本信息固定在顶部，不可拖拽 */}
      <BasicInfoForm />

      {/* 可拖拽排序的模块 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sectionOrder.map((key) => {
              const SectionComponent = sectionMap[key].component;
              return (
                <SortableSectionWrapper key={key} id={key}>
                  <SectionComponent />
                </SortableSectionWrapper>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
