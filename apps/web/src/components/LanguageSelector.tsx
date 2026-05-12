import type { Locale } from '../i18n.js';
import { locales } from '../i18n.js';

type LanguageSelectorProps = {
  label: string;
  locale: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageSelector({
  label,
  locale,
  onChange
}: LanguageSelectorProps) {
  return (
    <label className="language-select">
      <span>{label}</span>
      <select
        aria-label={label}
        onChange={(event) => onChange(event.target.value as Locale)}
        value={locale}
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
