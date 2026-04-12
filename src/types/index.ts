// Core format type used throughout the app
export type CronFormat = 'unix' | 'quartz' | 'github' | 'aws';

// One field in a cron expression (minute, hour, etc.)
export interface FieldDefinition {
  name: string;
  label: string;
  range: string;
}

// A format definition that drives both the UI tabs and field explainer
export interface CronFormatDefinition {
  id: CronFormat;
  label: string;
  description: string;
  fields: FieldDefinition[];
  placeholder: string;
}

// A single preset shown in the preset picker
export interface CronPreset {
  label: string;
  expression: string;
  format: CronFormat;
  description: string;
}
