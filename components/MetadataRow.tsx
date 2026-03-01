type MetadataItem = {
  label: string;
  value: string | number;
};

export function MetadataRow({ items }: { items: MetadataItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      {items.map((item) => (
        <span key={item.label} className="rounded border border-slate-700 px-2 py-1">
          <span className="mr-1 text-slate-500">{item.label}:</span>
          <span className="text-slate-300">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
