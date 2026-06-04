'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T extends { id?: string | number }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  selectable,
  onSelectionChange,
  emptyMessage = 'No data found.',
  loading,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = (a as Record<string, unknown>)[sortKey];
    const bv = (b as Record<string, unknown>)[sortKey];
    const cmp = String(av ?? '').localeCompare(String(bv ?? ''));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSelect = (id: string | number) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
    onSelectionChange?.(data.filter(r => n.has(r.id!)));
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const all = new Set(data.map(r => r.id!));
      setSelected(all);
      onSelectionChange?.(data);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="accent-[#C9A84C]"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                  className={`text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-[#0A1628]' : ''} ${col.className || ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : sorted.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-50 transition ${onRowClick ? 'cursor-pointer' : ''} ${selected.has(row.id!) ? 'bg-[#C9A84C]/5' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(row.id!); }}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id!)}
                      onChange={() => toggleSelect(row.id!)}
                      className="accent-[#C9A84C]"
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td key={String(col.key)} className={`px-3 py-3 ${col.className || ''}`}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
