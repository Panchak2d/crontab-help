export type CronFormat = 'unix' | 'quartz' | 'github' | 'aws';

export interface CronFormatDefinition {
  id: CronFormat;
  label: string;
  description: string;
  fieldCount: number;
  fields: FieldDefinition[];
  placeholder: string;
  example: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  range: string;
  // special characters info — rendered in FieldExplainer tooltip (future feature)
  special?: string;
}

export interface CronPreset {
  label: string;
  expression: string;
  format: CronFormat;
  description: string;
}
