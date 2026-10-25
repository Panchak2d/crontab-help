import { LOCALES, isLocaleCode, localeName, type LocaleCode } from '../utils/locale';

interface Props {
  locale: LocaleCode;
  failed: boolean;
  onChange: (locale: LocaleCode) => void;
}

export function LanguageSelect({ locale, failed, onChange }: Props) {
  return (
    <div className="lang-control">
      <label className="lang-label" htmlFor="description-language">Language</label>
      <select
        id="description-language"
        className="builder-select lang-select"
        value={locale}
        onChange={e => { if (isLocaleCode(e.target.value)) onChange(e.target.value); }}
      >
        {LOCALES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
      {failed && (
        <span className="lang-note" role="status">
          Couldn’t load {localeName(locale)}; showing English
        </span>
      )}
    </div>
  );
}
