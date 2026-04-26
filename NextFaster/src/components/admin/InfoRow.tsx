interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isRTL?: boolean;
}

export default function InfoRow({ icon, label, value, isRTL }: InfoRowProps) {
  return (
    <div className={`flex items-start gap-3 rounded-xl bg-neutral-50/70 p-4 border border-neutral-100/50 transition-colors hover:bg-neutral-50 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm border border-neutral-100 text-neutral-500 shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-neutral-500">{label}</p>
        <p className={`mt-0.5 text-sm font-black truncate ${value ? 'text-neutral-900' : 'text-neutral-300'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}
