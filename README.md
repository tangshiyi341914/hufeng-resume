# 呼风简历

在线简历制作工具，支持多模板实时预览、精细化排版配置、纯客户端 PDF 导出。

## 功能特性

- **3 套简历模板** — 经典（Classic）、现代（Modern）、极简（Minimal），实时切换预览
- **可配置排版系统** — 字号、行高、模块间距、页边距、主题色均可精细调节
- **逐字段文字颜色** — 每个字段独立配置 7 档灰度等级，自由控制视觉层次
- **富文本描述** — 支持加粗、有序/无序列表，预览与 PDF 导出像素级一致
- **纯客户端 PDF 导出** — 基于 html2canvas-pro + jsPDF，无需服务端参与
- **云端保存** — Express API + JSON 文件持久化，支持多份简历管理
- **拖拽排序** — 模块可拖拽调整顺序（基于 @dnd-kit）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| CSS | Tailwind CSS 3 |
| 状态管理 | Zustand 4 |
| 路由 | react-router-dom 6 |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 后端 | Express 4 (tsx 热重载) |
| PDF 导出 | html2canvas-pro + jsPDF |
| 图标 | lucide-react |

## 快速开始

```bash
# 安装依赖
npm install

# 同时启动前后端（推荐）
npm run dev

# 前端 → http://localhost:3000
# 后端 → http://localhost:3001
```

也可以分别启动：

```bash
npm run dev:client   # Vite dev server → localhost:3000
npm run dev:server   # Express API → localhost:3001 (tsx 热重载)
```

生产构建：

```bash
npm run build         # Vite 构建 → dist/
npm start             # tsx 启动 Express 服务
```

## 目录结构

```
.
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # Vite 配置，/api 代理到 :3001
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json               # 服务端 TS 配置
├── server/                     # 后端代码
│   ├── index.ts                # Express API 路由
│   └── db.ts                   # JSON 文件存储 (data.json)
├── src/                        # 前端代码
│   ├── types/resume.ts         # 所有 TS 类型定义
│   ├── store/resumeStore.ts    # Zustand 状态管理
│   ├── api/index.ts            # 前端 fetch 封装
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── ResumeForm/         # 编辑表单（含 BoldTextarea 富文本）
│   │   ├── ResumeConfig/       # 排版+颜色配置侧边栏
│   │   └── ResumePreview/      # 模板选择器 + 3 套模板
│   ├── pages/
│   │   ├── HomePage.tsx        # 模板选择首页
│   │   ├── EditorPage.tsx      # 编辑器（核心页面）
│   │   └── MyResumesPage.tsx   # 已保存简历列表
│   └── utils/
│       ├── resumeConfig.tsx    # applyConfig / renderRichText / colorFor
│       └── exportPdf.ts       # html2canvas + jsPDF 导出
└── public/                     # 静态资源
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/resumes` | 获取简历列表（按更新时间降序） |
| GET | `/api/resumes/:id` | 获取单份简历详情 |
| POST | `/api/resumes` | 创建简历 |
| PUT | `/api/resumes/:id` | 更新简历 |
| DELETE | `/api/resumes/:id` | 删除简历 |

请求体示例（POST / PUT）：

```json
{
  "title": "张三",
  "template": "classic",
  "data": { "basicInfo": {...}, "workExperience": [...], ... },
  "config": { "nameSize": 26, "themeColor": "#247aeb", ... },
  "sectionOrder": ["education", "internships", "workExperience", "projects", "skills", "languages", "certifications"]
}
```

## 数据模型

详见 `src/types/resume.ts`，核心类型：

- **Resume** — 顶层：id, title, template, data, config, sectionOrder
- **ResumeData** — 8 大模块：basicInfo, workExperience, internships, education, skills, projects, languages, certifications
- **ResumeConfig** — 排版参数 + FieldColors（逐字段文字颜色）
- **TextColorLevel** — 7 档灰度：`gray-300` ~ `gray-900`

## 数据存储

后端使用 `data.json` 作为持久化存储。首次启动时自动创建空文件。这是一个无鉴权的单用户方案，适合本地或个人部署使用。

**注意**：`data.json` 和 `public/photo.jpg` 已加入 `.gitignore`，不会被提交到仓库。

## 模板说明

### Classic（经典）
传统上下布局，衬线字体（Noto Serif SC），照片在头部左侧，主题色控制模块标题及分界线。

### Modern（现代）
深色左侧边栏（35%）+ 白色右侧（65%），照片居中于侧边栏顶部。技能、语言、证书固定在侧边栏。

### Minimal（极简）
留白设计，无衬线字体，照片在头部左侧，全局薄分界线使用主题色低透明度。

## License

MIT
