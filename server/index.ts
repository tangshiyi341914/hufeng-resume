import express from 'express';
import cors from 'cors';
import { getAllResumes, getResumeById, createResume, updateResume, deleteResume } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GET /api/resumes
app.get('/api/resumes', (_req, res) => {
  try {
    res.json(getAllResumes());
  } catch (error) {
    console.error('查询列表失败:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

// GET /api/resumes/:id
app.get('/api/resumes/:id', (req, res) => {
  try {
    const resume = getResumeById(req.params.id);
    if (!resume) return res.status(404).json({ error: '简历不存在' });
    res.json(resume);
  } catch (error) {
    console.error('查询失败:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

// POST /api/resumes
app.post('/api/resumes', (req, res) => {
  try {
    const { title, template, data, config, sectionOrder } = req.body;
    if (!title || !template || !data) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    res.status(201).json(createResume({ title, template, data, config, sectionOrder }));
  } catch (error) {
    console.error('创建失败:', error);
    res.status(500).json({ error: '创建失败' });
  }
});

// PUT /api/resumes/:id
app.put('/api/resumes/:id', (req, res) => {
  try {
    const { title, template, data, config, sectionOrder } = req.body;
    if (!title || !template || !data) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    const resume = updateResume(req.params.id, { title, template, data, config, sectionOrder });
    if (!resume) return res.status(404).json({ error: '简历不存在' });
    res.json(resume);
  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// DELETE /api/resumes/:id
app.delete('/api/resumes/:id', (req, res) => {
  try {
    if (!deleteResume(req.params.id)) {
      return res.status(404).json({ error: '简历不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 后端服务: http://localhost:${PORT}`);
  console.log(`📄 API: http://localhost:${PORT}/api/resumes`);
});
