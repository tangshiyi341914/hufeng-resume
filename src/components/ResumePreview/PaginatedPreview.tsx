import React, { useEffect, useRef, useState, useCallback } from 'react';

const A4_RATIO = 210 / 297; // width / height

interface Props {
  children: React.ReactNode;
}

export default function PaginatedPreview({ children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measureWrapRef = useRef<HTMLDivElement>(null);
  const measureContentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  // Each entry: { start, end } — the pixel range of content visible on that page
  const [pages, setPages] = useState<Array<{ start: number; end: number }>>([]);

  // Measure available width
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setContentWidth(w);
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const pageHeight = contentWidth > 0 ? Math.round(contentWidth / A4_RATIO) : 0;

  // Measure content height and calculate page ranges
  const measure = useCallback(() => {
    const wrap = measureWrapRef.current;
    const content = measureContentRef.current;
    if (!wrap || !content || pageHeight === 0) return;

    // Use getBoundingClientRect for pixel-accurate measurements
    const totalHeight = content.getBoundingClientRect().height;

    if (totalHeight <= pageHeight) {
      setPages([{ start: 0, end: totalHeight }]);
      return;
    }

    // Calculate pages — split at exact page height boundaries
    // Blocks are allowed to straddle pages naturally (only overflowing content moves to next page)
    const result: Array<{ start: number; end: number }> = [];
    let currentStart = 0;

    while (currentStart < totalHeight) {
      const pageEnd = Math.min(currentStart + pageHeight, totalHeight);
      result.push({ start: currentStart, end: pageEnd });
      currentStart = pageEnd;
    }

    setPages(result);
  }, [pageHeight]);

  useEffect(() => {
    measure();
    // Re-measure after fonts and layout settle
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });
    document.fonts.ready.then(measure);
    const timer = setTimeout(measure, 500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [measure, children]);

  // Re-measure when images load
  useEffect(() => {
    if (!measureWrapRef.current) return;
    const imgs = measureWrapRef.current.querySelectorAll('img');
    const handlers: Array<() => void> = [];
    imgs.forEach((img) => {
      if (!img.complete) {
        const handler = () => measure();
        img.addEventListener('load', handler);
        handlers.push(handler);
      }
    });
    return () => {
      imgs.forEach((img, i) => {
        if (handlers[i]) img.removeEventListener('load', handlers[i]);
      });
    };
  });

  const totalPages = pages.length;

  if (contentWidth === 0) {
    return <div ref={wrapperRef} style={{ width: '100%' }} />;
  }

  return (
    <div ref={wrapperRef} style={{ width: '100%' }}>
      {/* Rendered pages */}
      {pages.map((page, pageNum) => {
        const visibleHeight = page.end - page.start;
        return (
          <React.Fragment key={pageNum}>
            {pageNum > 0 && (
              <div className="flex items-center gap-3 py-3 select-none">
                <div className="flex-1 border-t border-dashed border-gray-300" />
                <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                  — 第 {pageNum} 页 / 共 {totalPages} 页 —
                </span>
                <div className="flex-1 border-t border-dashed border-gray-300" />
              </div>
            )}
            <div
              data-pdf-page="true"
              data-page-start={page.start}
              data-page-end={page.end}
              style={{
                width: contentWidth,
                height: visibleHeight,
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -page.start,
                  left: 0,
                  width: contentWidth,
                }}
              >
                {children}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Hidden measurement container — mirrors page container DOM structure */}
      <div
        ref={measureWrapRef}
        style={{
          position: 'absolute',
          left: -9999,
          top: 0,
          width: contentWidth,
          height: pageHeight || 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div
          ref={measureContentRef}
          data-pdf-source="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: contentWidth,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
