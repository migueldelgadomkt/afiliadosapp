import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full min-w-full table-auto text-left text-sm text-slate-700', className)} {...props} />;
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="text-xs uppercase text-slate-500" {...props} />;
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-slate-100" {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-slate-50 transition-colors', className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('py-3 text-xs font-semibold uppercase tracking-wide text-slate-500', className)} {...props} />;
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('py-3 text-sm text-slate-700', className)} {...props} />;
}
