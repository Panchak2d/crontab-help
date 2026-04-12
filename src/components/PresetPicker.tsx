import { useMemo } from 'react';
import type { CronFormat } from '../types';
import { CRON_PRESETS } from '../utils/constants';

interface Props {
  currentFormat: CronFormat;
  onSelect: (expression: string, format: CronFormat) => void;
}

interface PresetGroup {
  label: string;
  match: (expression: string) => boolean;
}

// Ordered from most specific to least — each preset lands in the first matching group
const PRESET_GROUPS: PresetGroup[] = [
  { label: 'Minutes',  match: e => /^\*\/\d+\s\*/.test(e) || e === '* * * * *' },
  { label: 'Hourly',   match: e => /^0\s\*/.test(e) || /^0\s\*\//.test(e) },
  { label: 'Daily',    match: e => /^0\s[\d,]+\s\*\s\*\s\*$/.test(e) },
  { label: 'Weekly',   match: e => /\s[0-7](,[0-7])*$/.test(e) || /\s[0-7]-[0-7]$/.test(e) },
  { label: 'Monthly',  match: e => /^0\s0\s[0-9L]/.test(e) },
  { label: 'Other',    match: () => true },
];

function buildGroups(format: CronFormat) {
  // Show current-format presets first, others after
  const sorted = [
    ...CRON_PRESETS.filter(p => p.format === format),
    ...CRON_PRESETS.filter(p => p.format !== format),
  ];

  const assigned = new Set<string>();
  const groups: { label: string; presets: typeof CRON_PRESETS }[] = [];

  for (const group of PRESET_GROUPS) {
    const matched = sorted.filter(p => {
      const key = p.expression + p.format;
      return !assigned.has(key) && group.match(p.expression);
    });
    if (matched.length > 0) {
      matched.forEach(p => assigned.add(p.expression + p.format));
      groups.push({ label: group.label, presets: matched });
    }
  }

  return groups;
}

export function PresetPicker({ currentFormat, onSelect }: Props) {
  // CRON_PRESETS is static — only rebuild groups when the selected format changes
  const groups = useMemo(() => buildGroups(currentFormat), [currentFormat]);

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
