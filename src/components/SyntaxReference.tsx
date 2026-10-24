import type { CronFormat } from '../types';
import { CRON_FORMATS, SYNTAX_REFERENCE } from '../utils/constants';

interface Props {
  currentFormat: CronFormat;
}

export function SyntaxReference({ currentFormat }: Props) {
  return (
    <details className="syntax-reference">
      <summary className="syntax-summary">Syntax differences between schedulers</summary>
      <div className="syntax-scroll">
        <table className="syntax-table">
          <thead>
            <tr>
              <th scope="col"></th>
              {CRON_FORMATS.map(f => (
                <th key={f.id} scope="col" className={f.id === currentFormat ? 'syntax-current' : ''}>
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SYNTAX_REFERENCE.map(row => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {CRON_FORMATS.map(f => (
                  <td key={f.id} className={f.id === currentFormat ? 'syntax-current' : ''}>
                    {row.label === 'Example' || row.label === 'Order' ? <code>{row.values[f.id]}</code> : row.values[f.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
