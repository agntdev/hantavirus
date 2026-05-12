type InfoCardProps = {
  accent?: 'blue' | 'gold' | 'green' | 'red';
  description: string;
  title: string;
};

export function InfoCard({ accent = 'green', description, title }: InfoCardProps) {
  return (
    <article className={`info-card info-card-${accent}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
