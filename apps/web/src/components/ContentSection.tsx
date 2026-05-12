import type { ReactNode } from 'react';

type ContentSectionProps = {
  children: ReactNode;
  eyebrow: string;
  id: string;
  intro?: string;
  title: string;
};

export function ContentSection({
  children,
  eyebrow,
  id,
  intro,
  title
}: ContentSectionProps) {
  return (
    <section className="content-section" id={id}>
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}
