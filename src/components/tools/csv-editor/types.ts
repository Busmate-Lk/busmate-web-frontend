// CSV Editor Types
export interface CSVRow {
  [key: string]: string | number | boolean | undefined;
}

export interface CSVData {
  headers: string[];
  rows: CSVRow[];
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface CSVEditorProps {
  onDataChange?: (data: CSVData) => void;
  onValidationChange?: (result: ValidationResult) => void;
  onImport?: (data: CSVData) => Promise<void>;
  initialData?: CSVData;
  validationRules?: ValidationRule[];
  maxRows?: number;
  maxFileSize?: number; // in bytes
  allowedColumns?: string[];
  requiredColumns?: string[];
  isLoading?: boolean;
  disabled?: boolean;
}

export interface ValidationRule {
  column: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customValidator?: (value: any, row: CSVRow, rowIndex: number) => string | null;
}

// Bus Stop specific types
export interface BusStopCSVRow extends CSVRow {
  name?: string;
  name_sinhala?: string;
  name_tamil?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  address_sinhala?: string;
  address_tamil?: string;
  city?: string;
  city_sinhala?: string;
  city_tamil?: string;
  state?: string;
  state_sinhala?: string;
  state_tamil?: string;
  country?: string;
  country_sinhala?: string;
  country_tamil?: string;
  zipCode?: string;
  isAccessible?: boolean;
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  isImporting: boolean;
  errors?: Array<{
    row: number;
    message: string;
  }>;
}