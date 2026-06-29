import express from 'express';
import cors from 'cors';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import { getAllResumes, getResumeById, createResume, updateResume, deleteResume } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Puppeteer 浏览器实例（复用，避免每次请求都启动浏览器）
let browserPromise: Promise<Browser> | null = null;

/**
 * 查找系统中可用的 Chrome/Chromium 路径。
 * 优先级：Puppeteer 内置 > 系统 Chrome > 系统 Edge
 */
async function findChrome(): Promise<string> {
  // 辅助：检查文件是否存在
  const { stat } = await import('node:fs/promises');
  const exists = async (p: string) => {
    try {
      await stat(p);
      return true;
    } catch {
      return false;
    }
  };

  // 1. 尝试 Puppeteer 自带的 Chrome（可能下载失败，所以先检查文件存在）
  try {
    const builtin = await puppeteer.executablePath();
    if (builtin && (await exists(builtin))) return builtin;
  } catch { /* 忽略 */ }

  // 2. 尝试系统 Chrome
  const systemChrome =
    'C:/Program Files/Google/Chrome/Application/chrome.exe';
  if (await exists(systemChrome)) return systemChrome;

  // 3. 尝试系统 Edge
  const systemEdge =
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  if (await exists(systemEdge)) return systemEdge;

  throw new Error('无法找到 Chrome/Edge 浏览器，请安装 Chrome');
}

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = findChrome()
      .then((executablePath) =>
        puppeteer.launch({
          headless: true,
          executablePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        })
      )
      .catch((err) => {
        browserPromise = null; // 重置，允许下次重试
        throw err;
      });
  }
  return browserPromise;
}

// POST /api/export-pdf — 使用 Puppeteer 将简历 HTML 渲染为真正的 PDF（文字可选中）
app.post('/api/export-pdf', async (req, res) => {
  const { html, styles, width, baseUrl } = req.body;

  if (!html || html.length < 50) {
    return res.status(400).json({ error: 'HTML 内容为空' });
  }

  const contentWidth = parseInt(String(width), 10) || 800;

  const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
${baseUrl ? `<base href="${baseUrl}/">` : ''}
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<style>${styles || ''}</style>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #resume-root {
    width: ${contentWidth}px;
    margin: 0 auto;
    background: white;
  }
  /* 防止客户端 CSS 中的 @media print 隐藏内容 */
  #resume-root, #resume-root * { visibility: visible !important; }
  @page { size: A4; margin: 0; }
</style>
</head>
<body>
<div id="resume-root">${html}</div>
</body>
</html>`;

  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // 视口宽度略大于内容宽度，确保内容不被裁切
    await page.setViewport({
      width: Math.max(contentWidth + 40, 840),
      height: 800,
    });

    await page.setContent(fullHTML, {
      waitUntil: 'load',
      timeout: 30000,
    });

    // 等待字体加载完成（Google Fonts 需要额外时间）
    await page.evaluate(() => document.fonts.ready);
    // 额外等待布局和网络请求稳定
    await new Promise((r) => setTimeout(r, 1000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length.toString(),
    });
    res.send(Buffer.from(pdfBuffer));
  } catch (error: any) {
    console.error('PDF 生成失败:', error);
    res.status(500).json({ error: 'PDF 生成失败，请重试' });
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
});

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

// ========== 生产环境：静态文件 + SPA 路由回退 ==========
// 仅在未通过 Vite 代理时生效（即生产模式 npm start）
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const distIndex = path.join(distDir, 'index.html');

// 托管前端静态文件 + SPA 路由回退（仅在 dist/ 存在时启用）
// 开发模式下用户访问 Vite :3000 端口，不会命中此路由，互不干扰
if (existsSync(distIndex)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(distIndex);
  });
  console.log(`📦 静态文件服务已启用 (${distDir})`);
}

const server = app.listen(PORT, () => {
  console.log(`✅ 后端服务: http://localhost:${PORT}`);
  console.log(`📄 API: http://localhost:${PORT}/api/resumes`);
  console.log(`🖨️  PDF 导出: POST http://localhost:${PORT}/api/export-pdf`);
});

// 优雅关闭：退出前关闭 Puppeteer 浏览器
async function shutdown() {
  if (browserPromise) {
    try {
      const browser = await browserPromise;
      await browser.close();
      console.log('🔒 Puppeteer 浏览器已关闭');
    } catch {}
  }
  server.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
