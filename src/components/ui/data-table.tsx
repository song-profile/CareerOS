import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface DataTableColumn {
  key: string;
  header: ReactNode;
  className?: string;
}

interface DataTableProps<TItem> {
  columns: DataTableColumn[];
  items: TItem[];
  getRowKey: (item: TItem) => string;
  renderCell: (item: TItem, columnKey: string) => ReactNode;
  className?: string;
}

export function DataTable<TItem>({
  className,
  columns,
  getRowKey,
  items,
  renderCell,
}: DataTableProps<TItem>) {
  return (
    <Card className={cn("hidden overflow-hidden lg:block", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-caption text-neutral-600">
            <tr>
              {columns.map((column) => (
                <th className={cn("px-4 py-3 font-medium", column.className)} key={column.key}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item) => (
              <tr className="hover:bg-neutral-50" key={getRowKey(item)}>
                {columns.map((column) => (
                  <td className="px-4 py-4" key={column.key}>
                    {renderCell(item, column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
