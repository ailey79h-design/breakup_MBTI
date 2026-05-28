type ExploreSectionHeaderProps = {
  badge?: string;
  title: string;
  subtitle?: string;
};

export function ExploreSectionHeader({
  badge,
  title,
  subtitle,
}: ExploreSectionHeaderProps) {
  return (
    <div className="text-center px-2 mb-5 fade-in">
      {badge && <span className="badge-pill mb-3 inline-block">{badge}</span>}
      <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
