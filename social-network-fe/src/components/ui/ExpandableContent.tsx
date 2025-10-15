import { useEffect, useRef, useState } from 'react';

interface ExpandableProps {
  text?: string;
  html?: string;
  maxLines?: number;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
  showButton?: boolean;
  buttonClassName?: string;
  maxHeight?: number;
  maxHeightExpanded?: number;
}

export function ExpandableContent({
  text,
  html,
  maxLines = 3,
  className = '',
  expandLabel = 'Xem thêm',
  collapseLabel = 'Thu gọn',
  showButton = true,
  buttonClassName,
  maxHeight,
  maxHeightExpanded,
}: ExpandableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '0');
    const collapsedMaxH = maxHeight ?? lineHeight * maxLines;

    setClamped(el.scrollHeight > collapsedMaxH + 1);
  }, [text, html, maxLines, maxHeight]);

  return (
    <div className={className}>
      <div
        ref={ref}
        className="whitespace-pre-line break-words"
        style={{
          display: maxHeight ? 'block' : '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: !maxHeight && !expanded ? maxLines : 'unset',

          overflow: expanded ? 'auto' : 'hidden',
          maxHeight: expanded
            ? maxHeightExpanded ?? 'none'
            : maxHeight ?? undefined,
        }}
        {...(html
          ? { dangerouslySetInnerHTML: { __html: html } }
          : { children: text })}
      />
      {clamped && showButton && (
        <button
          className={
            buttonClassName ??
            'text-sm font-medium text-gray-600 cursor-pointer'
          }
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
}
