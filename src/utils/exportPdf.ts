/**
 * 导出 PDF：收集简历 HTML + 所有 CSS 样式，发送到服务端用 Puppeteer (headless Chrome)
 * 渲染并生成真正的 PDF（文字可选中/复制/搜索），然后触发浏览器下载。
 */

/**
 * 从 DOM 中提取完整简历内容 HTML 和渲染宽度。
 * PaginatedPreview 的每个 [data-pdf-page] 内层 div 包含完整的模板渲染结果，
 * 取第一个即可获得全部内容。
 */
function collectResumeHTML(elementId: string): { html: string; width: number } {
  const root = document.getElementById(elementId);
  if (!root) throw new Error('未找到简历预览元素');

  // 优先从分页容器获取完整内容
  const pageEl = root.querySelector<HTMLElement>('[data-pdf-page]');
  if (pageEl?.firstElementChild) {
    const inner = pageEl.firstElementChild as HTMLElement;
    const width = parseInt(inner.style.width) || 800;
    const html = inner.innerHTML;
    if (html.trim()) return { html, width };
  }

  // 回退：使用测量容器 [data-pdf-source]
  const sourceEl = root.querySelector<HTMLElement>('[data-pdf-source]');
  if (sourceEl) {
    const width = parseInt(sourceEl.style.width) || 800;
    const html = sourceEl.innerHTML;
    if (html.trim()) return { html, width };
  }

  throw new Error('简历内容为空，请先填写简历信息');
}

/**
 * 收集页面中所有 CSS 样式。
 * 包括内联 <style> 标签（Vite dev 模式下的 Tailwind）和外链样式表。
 */
async function collectAllStyles(): Promise<string> {
  const parts: string[] = [];

  // 1. 内联 <style> 标签
  document.querySelectorAll('style').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) parts.push(text);
  });

  // 2. 外链样式表（同源 fetch）
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
  for (const link of links) {
    try {
      const res = await fetch(link.href);
      if (res.ok) {
        const css = await res.text();
        if (css.trim()) parts.push(css);
      }
    } catch {
      console.warn('无法获取样式表:', link.href);
    }
  }

  return parts.join('\n\n');
}

export async function exportToPDF(elementId: string, filename = '简历.pdf') {
  let html: string;
  let width: number;

  try {
    const result = collectResumeHTML(elementId);
    html = result.html;
    width = result.width;
  } catch (err: any) {
    alert(err.message || '无法获取简历内容');
    return;
  }

  // 显示进度提示
  const toast = document.createElement('div');
  toast.className =
    'fixed top-4 left-1/2 -translate-x-1/2 z-[99999] bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2';
  toast.innerHTML = `
    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
    正在生成 PDF...
  `;
  document.body.appendChild(toast);

  try {
    const styles = await collectAllStyles();

    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        styles,
        width,
        baseUrl: window.location.origin,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    // 下载 PDF
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.innerHTML = `
      <svg class="h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      PDF 导出成功
    `;
    toast.className = toast.className.replace('bg-gray-900', 'bg-emerald-700');
  } catch (err: any) {
    console.error('导出PDF失败:', err);
    toast.innerHTML = `
      <svg class="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      导出失败：${err.message || '请重试'}
    `;
    toast.className = toast.className.replace('bg-gray-900', 'bg-red-800');
  } finally {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}
