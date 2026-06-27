import React from 'react';
import { ResumeConfig, textColorMap, TextColorLevel } from '../types/resume';

export function applyConfig(config: ResumeConfig) {
  return {
    nameSize: `${config.nameSize}px`,
    sectionTitleSize: `${config.sectionTitleSize}px`,
    bodySize: `${config.bodySize}px`,
    lineHeight: String(config.lineHeight),
    sectionSpacing: `${config.sectionSpacing}px`,
    itemSpacing: `${config.itemSpacing}px`,
    pageMarginX: `${config.pageMarginX}px`,
    pageMarginY: `${config.pageMarginY}px`,
    themeColor: config.themeColor,
    fieldColors: config.fieldColors,
  };
}

export function colorFor(level: TextColorLevel): string {
  return textColorMap[level] || '#374151';
}

// 解析标记：**加粗**、无序列表(- 开头)、有序列表(1. 开头)、保留换行
export function renderRichText(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');

  // 检测是否存在列表行
  const hasList = lines.some((l) => /^[-*]\s/.test(l) || /^\d+[.\)]\s/.test(l));
  if (!hasList) {
    // 无列表：简单按加粗 + 换行渲染
    return lines.map((line, li) => (
      <React.Fragment key={li}>
        {li > 0 && <br />}
        {renderInline(line)}
      </React.Fragment>
    ));
  }

  // 有列表：将连续列表项分组渲染为 <ul> 或 <ol>
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const ulMatch = line.match(/^[-*]\s+(.*)/);
    const olMatch = line.match(/^(\d+)[.\)]\s+(.*)/);

    if (ulMatch) {
      // 收集连续的无序列表项
      const items: string[] = [ulMatch[1]];
      i++;
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      // 圆点用真实 DOM 绘制（而非原生 ::marker），并用悬挂缩进对齐换行文本。
      // html2canvas 不绘制 ::marker 伪元素，改用真实 DOM 后预览区与导出 PDF 像素级一致。
      // 圆点宽度 0.5em + 间距 0.5em = 缩进 1em，换行文本与首行文本左对齐。
      result.push(
        <ul key={result.length} style={{ listStyle: 'none', margin: '0 0 4px 0', padding: 0, paddingLeft: '1em' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ textIndent: '-1em', margin: `0 0 ${idx === items.length - 1 ? 0 : 2}px 0` }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '0.5em',
                  height: '0.5em',
                  borderRadius: '50%',
                  background: 'currentColor',
                  marginRight: '0.5em',
                  verticalAlign: 'middle',
                }}
              />
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    } else if (olMatch) {
      // 收集连续的有序列表项
      const items: string[] = [olMatch[2]];
      let startNum = parseInt(olMatch[1], 10);
      i++;
      while (i < lines.length && /^\d+[.\)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+[.\)]\s+/, ''));
        i++;
      }
      // 序号用真实文本 <span> 绘制（右对齐固定列宽），同样避免 ::marker 在 PDF 中丢失。
      // 序号列 1.5em + 间距 0.4em = 缩进 1.9em。
      result.push(
        <ol key={result.length} style={{ listStyle: 'none', margin: '0 0 4px 0', padding: 0, paddingLeft: '1.9em' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ textIndent: '-1.9em', margin: `0 0 ${idx === items.length - 1 ? 0 : 2}px 0` }}>
              <span
                aria-hidden="true"
                style={{ display: 'inline-block', width: '1.5em', textAlign: 'right', marginRight: '0.4em' }}
              >
                {startNum + idx}.
              </span>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    } else {
      // 普通行
      result.push(
        <React.Fragment key={result.length}>
          {result.length > 0 && <br />}
          {renderInline(line)}
        </React.Fragment>
      );
      i++;
    }
  }
  return <>{result}</>;
}

// 内联渲染 **加粗**
function renderInline(text: string): React.ReactNode {
  if (!text) return null;
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// 兼容旧接口名
export const renderBoldText = renderRichText;
