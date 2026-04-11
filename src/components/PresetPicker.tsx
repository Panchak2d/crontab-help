import type { CronFormat } from '../types';
import { CRON_PRESETS } from '../utils/constants';

interface Props {
  currentFormat: CronFormat;
  onSelect: (expression: string, format: CronFormat) => void;
}

// Group presets by time-scale category for scannable layout
const PRESET_GROUPS: { label: string; match: (expr: string) => boolean }[] = [
  { label: 'Minutes',  match: e => /^\*\/\d+\s\*/.test(e) || e === '* * * * *' },
  { label: 'Hourly',   match: e => /^0\s\*/.test(e) || /^0\s\*\//.test(e) },
  { label: 'Daily',    match: e => /^0\s\d+\s\*\s\*\s\*$/.test(e) || /^0\s[\d,]+\s\*\s\*\s\*$/.test(e) },
  { label: 'Weekly',   match: e => /\s[0-7]$/.test(e) || /\s[0-7],[0-7]$/.test(e) || /\s[0-7]-[0-7]$/.test(e) },
  { label: 'Monthly',  match: e => /^0\s0\s[0-9]/.test(e) },
  { label: 'Other',    match: () => true },
];

function groupPresets(format: CronFormat) {
  const forCurrentFormat = CRON_PRESETS.filter(p => p.format === format);
  const others = CRON_PRESETS.filter(p => p.format !== format);
  const all = [...forCurrentFormat, ...others];

  const groups: { label: string; presets: typeof CRON_PRESETS }[] = [];
  const assigned = new Set<string>();

  for (const group of PRESET_GROUPS) {
    const matched = all.filter(
      p => !assigned.has(p.expression + p.format) && group.match(p.expression)
    );
    if (matched.length > 0) {
      matched.forEach(p => assigned.add(p.expression + p.format));
      groups.push({ label: group.label, presets: matched });
    }
  }
  return groups;
}

export function PresetPicker({ currentFormat, onSelect }: Props) {
  const groups = groupPresets(currentFormat);

  return (
    <section className="preset-picker">
      <div className="panel-header">
        <span className="panel-label">Common Presets</span>
      </div>
      <div className="preset-groups">
        {groups.map(group => (
          <div key={group.label}>
            <span className="preset-group-label">{group.label}</span>
            {group.presets.map(preset => (
              <button
                key={preset.expression + preset.format}
                className="preset-btn"
                onClick={() => onSelect(preset.expression, preset.format)}
                title={preset.description}
              >
                <span className="preset-label">{preset.label}</span>
                {preset.format !== currentFormat && (
                  <span className="preset-format-badge">{preset.format}</span>
                )}
                <code className="preset-expr">{preset.expression}</code>
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
