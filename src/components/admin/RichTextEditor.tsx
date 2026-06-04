'use client';
import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

type ToolbarAction = { label: string; prefix: string; suffix: string };

const ACTIONS: ToolbarAction[] = [
  { label: 'B', prefix: '**', suffix: '**' },
  { label: 'I', prefix: '_', suffix: '_' },
  { label: 'H2', prefix: '\n## ', suffix: '\n' },
  { label: 'H3', prefix: '\n### ', suffix: '\n' },
  { label: '❝', prefix: '\n> ', suffix: '\n' },
  { label: '• List', prefix: '\n- ', suffix: '\n' },
  { label: '1. List', prefix: '\n1. ', suffix: '\n' },
  { label: '🔗 Link', prefix: '[', suffix: '](url)' },
];

export function RichTextEditor({ value, onChange, placeholder, rows = 10, label }: RichTextEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  const apply = (action: ToolbarAction) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + action.prefix + selected + action.suffix + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.selectionStart = start + action.prefix.length;
      ta.selectionEnd = start + action.prefix.length + selected.length;
      ta.focus();
    }, 0);
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#C9A84C]">
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-100">
          {ACTIONS.map(a => (
            <button
              key={a.label}
              type="button"
              onClick={() => apply(a)}
              className="px-2 py-1 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] transition"
            >
              {a.label}
            </button>
          ))}
        </div>
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Write in Markdown...'}
          rows={rows}
          className="w-full px-4 py-3 text-sm outline-none resize-y font-mono"
        />
      </div>
    </div>
  );
}
