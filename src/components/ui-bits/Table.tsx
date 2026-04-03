import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const tableStyles = tv({
  slots: {
    wrapper: 'relative w-full overflow-auto rounded-lg',
    table: 'w-full caption-bottom text-sm',
    header: 'border-b',
    body: '[&_tr:last-child]:border-0',
    footer: 'border-t bg-gray-50 font-medium',
    row: 'border-b transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/60 data-[state=selected]:bg-gray-50',
    head: 'h-12 px-4 text-left align-middle font-semibold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/60',
    cell: 'p-4 align-middle [&:has([role=checkbox])]:pr-0',
  },
});

const { wrapper, table, header, body, footer, row, head, cell } = tableStyles();

export const Table = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={wrapper()}>
      <table className={table({ className })}>{children}</table>
    </div>
  );
};

export const TableHeader = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <thead className={header({ className })}>{children}</thead>;
};

export const TableBody = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <tbody className={body({ className })}>{children}</tbody>;
};

export const TableFooter = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <tfoot className={footer({ className })}>{children}</tfoot>;
};

export const TableRow = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <tr className={row({ className })}>{children}</tr>;
};

export const TableHead = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <th className={head({ className })}>{children}</th>;
};

export const TableCell = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <td className={cell({ className })}>{children}</td>;
};
