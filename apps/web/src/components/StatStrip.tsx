type StatItem = {
  label: string;
  value: string;
};

type StatStripProps = {
  items: StatItem[];
};

export function StatStrip({ items }: StatStripProps) {
  return (
    <dl className="stat-strip">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
