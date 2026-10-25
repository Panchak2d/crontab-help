import type { ReactNode } from 'react';

interface Props {
  description: string;
  isError: boolean;
  isEmpty: boolean;
  lang: string;
  dir: 'ltr' | 'rtl';
  children?: ReactNode;
}

export function Description({ description, isError, isEmpty, lang, dir, children }: Props) {
  const textClass = isEmpty
    ? 'description-text--empty'
    : isError
    ? 'description-text--error'
    : '';

  return (
    <div className="description-panel">
      <p className={`description-text ${textClass}`} lang={lang} dir={dir}>
        {description}
      </p>
      {children}
    </div>
  );
}
