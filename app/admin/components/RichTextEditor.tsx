'use client';

import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = beforeText + prefix + selectedText + (suffix || prefix) + afterText;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + (suffix || prefix).length;
      textarea.setSelectionRange(
        selectedText ? newCursorPos : start + prefix.length,
        selectedText ? newCursorPos : start + prefix.length
      );
    }, 0);
  };

  const insertImage = () => {
    const url = prompt('请输入图片URL:');
    if (url) {
      insertFormatting(`[图片](${url})`, '');
    }
  };

  const insertVideo = () => {
    const url = prompt('请输入视频URL (支持B站、YouTube等):');
    if (url) {
      insertFormatting(`[视频](${url})`, '');
    }
  };

  const insertLink = () => {
    const url = prompt('请输入链接地址:');
    if (url) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end) || '链接文本';
      insertFormatting(`[${selectedText}](${url})`, '');
    }
  };

  const insertTable = () => {
    const table = `
| 列1 | 列2 | 列3 |
| --- | --- | --- |
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |
`;
    insertFormatting(table, '');
  };

  const toolbarButtons = [
    { icon: 'B', title: '加粗', action: () => insertFormatting('**') },
    { icon: 'I', title: '斜体', action: () => insertFormatting('*') },
    { icon: 'U', title: '下划线', action: () => insertFormatting('<u>', '</u>') },
    { icon: 'S', title: '删除线', action: () => insertFormatting('~~') },
    { icon: 'H1', title: '标题', action: () => insertFormatting('\n## ', '\n') },
    { icon: '🔗', title: '链接', action: insertLink },
    { icon: '🖼️', title: '图片', action: insertImage },
    { icon: '🎬', title: '视频', action: insertVideo },
    { icon: '📊', title: '表格', action: insertTable },
    { icon: '•', title: '列表', action: () => insertFormatting('\n- ', '') },
    { icon: '1.', title: '数字列表', action: () => insertFormatting('\n1. ', '') },
    { icon: '"', title: '引用', action: () => insertFormatting('\n> ', '') },
    { icon: '📎', title: '分隔线', action: () => insertFormatting('\n---\n', '') },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-2 rounded-sm" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}>
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="w-8 h-8 flex items-center justify-center text-white rounded hover:bg-white/20 transition-colors text-sm font-bold"
          >
            {btn.icon}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none font-mono text-sm"
        style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
      />
      <div className="text-white/40 text-xs">
        支持 Markdown 语法。可用工具栏插入格式，或手动输入。
      </div>
    </div>
  );
}