import { ReactNode } from "react";

export function SidebarInfo({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-200">{title}</h3>
      <div className="text-sm text-slate-300">{children}</div>
    </aside>
  );
}
