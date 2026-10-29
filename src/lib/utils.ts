import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

/**
 * Universal CSV Exporter
 * Correctly quotes fields, formats Indian numbers, and triggers browser file download.
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columnMap: { key: keyof T | ((row: T) => any); label: string }[]
) {
  if (!rows || rows.length === 0) {
    alert('No data to export for the selected filter.');
    return;
  }

  const headers = columnMap.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  const body = rows.map(row => {
    return columnMap.map(col => {
      let val = typeof col.key === 'function' ? col.key(row) : row[col.key];
      if (val === undefined || val === null) val = '';
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  }).join('\n');

  const csvContent = `${headers}\n${body}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
