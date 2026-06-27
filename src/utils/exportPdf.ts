import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/** 渲染缩放倍数（3x ≈ 300dpi 级别，打印足够清晰） */
const RENDER_SCALE = 3;
/** JPEG 压缩质量 0–1（白底黑字 0.80 肉眼几乎无损，体积大幅缩减） */
const JPEG_QUALITY = 0.80;
/** 导出图片格式 */
const IMG_FORMAT: 'JPEG' | 'PNG' = 'JPEG';

export async function exportToPDF(elementId: string, filename = '简历.pdf') {
  const root = document.getElementById(elementId);
  if (!root) {
    alert('未找到简历预览元素');
    return;
  }

  try {
    await document.fonts.ready;

    const pages = Array.from(
      root.querySelectorAll<HTMLElement>('[data-pdf-page]')
    );

    if (pages.length === 0) {
      await exportSinglePageFallback(root, filename);
      return;
    }

    const pageRanges = pages.map((el) => ({
      start: parseFloat(el.dataset.pageStart || '0'),
      end: parseFloat(el.dataset.pageEnd || '0'),
    }));

    const measuredTotalHeight = Math.max(...pageRanges.map((r) => r.end));
    if (!measuredTotalHeight) {
      await exportSinglePageFallback(root, filename);
      return;
    }

    // 使用第一个可见分页容器（屏上渲染），在 onclone 中将内部 absolute
    // 子元素改为 relative（normal flow），让容器 height:auto 自然撑开到
    // 真实内容高度。然后用实际渲染高度和测量高度的比例，校正所有分页区间，
    // 消除测量源与渲染源之间的任何偏差。
    const firstPage = pages[0];

    const fullCanvas = await html2canvas(firstPage, {
      scale: RENDER_SCALE,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (_doc, clonedEl) => {
        fixStickyAll(clonedEl);
        clonedEl.style.overflow = 'visible';
        clonedEl.style.height = 'auto';
        clonedEl.style.boxShadow = 'none';
        const inner = clonedEl.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.position = 'relative';
          inner.style.top = 'auto';
        }
      },
      backgroundColor: '#ffffff',
    });

    // 实际渲染高度 vs 测量高度 —— 按比例校正分页区间
    const actualTotalHeight = fullCanvas.height / RENDER_SCALE;
    const ratio = measuredTotalHeight > 0
      ? actualTotalHeight / measuredTotalHeight
      : 1;

    const adjustedRanges = pageRanges.map((r) => ({
      start: r.start * ratio,
      end: r.end * ratio,
    }));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeightMm = 297;

    for (let i = 0; i < adjustedRanges.length; i++) {
      const { start, end } = adjustedRanges[i];

      const srcY = Math.round(start * RENDER_SCALE);
      const srcEnd = Math.min(Math.round(end * RENDER_SCALE), fullCanvas.height);
      const srcH = Math.max(1, srcEnd - srcY);

      const slice = document.createElement('canvas');
      slice.width = fullCanvas.width;
      slice.height = srcH;
      const ctx = slice.getContext('2d')!;
      ctx.drawImage(
        fullCanvas,
        0, srcY,
        fullCanvas.width, srcH,
        0, 0,
        fullCanvas.width, srcH
      );

      const mimeType = IMG_FORMAT === 'PNG' ? 'image/png' : 'image/jpeg';
      const imgData = slice.toDataURL(mimeType, JPEG_QUALITY);
      const imgHeight = (srcH * imgWidth) / fullCanvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, IMG_FORMAT, 0, 0, imgWidth, Math.min(imgHeight, pageHeightMm));
    }

    pdf.save(filename);
  } catch (error) {
    console.error('导出PDF失败:', error);
    alert('导出PDF失败，请重试');
  }
}

async function exportSinglePageFallback(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: RENDER_SCALE,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    onclone: (_doc, clonedEl) => fixStickyAll(clonedEl),
    backgroundColor: '#ffffff',
  });
  const mimeType = IMG_FORMAT === 'PNG' ? 'image/png' : 'image/jpeg';
  const imgData = canvas.toDataURL(mimeType, JPEG_QUALITY);
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, IMG_FORMAT, 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, IMG_FORMAT, 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

function fixStickyAll(target: HTMLElement) {
  const stickyEls = target.querySelectorAll('.sticky');
  stickyEls.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.position = 'static';
    htmlEl.style.top = 'auto';
    htmlEl.classList.remove('sticky', 'top-4');
  });
  let ancestor = target.parentElement;
  while (ancestor) {
    if (ancestor.classList.contains('sticky')) {
      ancestor.style.position = 'static';
      ancestor.style.top = 'auto';
      ancestor.classList.remove('sticky', 'top-4');
    }
    ancestor = ancestor.parentElement;
  }
}
