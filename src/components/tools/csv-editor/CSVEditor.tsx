'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle, Upload, FileText, Download } from 'lucide-react';
import { CSVUploader } from './CSVUploader';
import { CSVDataTable } from './CSVDataTable';
import { validateCSVData, getValidationSummary, BUS_STOP_VALIDATION_RULES } from './CSVValidator';
import { CSVData, ValidationResult, ImportProgress, CSVEditorProps } from './types';
import { BusStopManagementService } from '@/lib/api-client/route-management';

const DEFAULT_CSV_EDITOR_PROPS: Partial<CSVEditorProps> = {
  maxRows: 1000,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  validationRules: BUS_STOP_VALIDATION_RULES,
  requiredColumns: ['name'], // At least one name field through custom validation
  isLoading: false,
  disabled: false
};

interface CSVEditorForBusStopsProps extends Omit<CSVEditorProps, 'onImport'> {
  onImport?: (data: CSVData) => Promise<void>;
  onImportComplete?: (result: any) => void;
  onImportError?: (error: string) => void;
  defaultCountry?: string;
}

export function CSVEditor({
  onDataChange,
  onValidationChange,
  onImport,
  onImportComplete,
  onImportError,
  initialData,
  maxRows = DEFAULT_CSV_EDITOR_PROPS.maxRows,
  maxFileSize = DEFAULT_CSV_EDITOR_PROPS.maxFileSize,
  validationRules = DEFAULT_CSV_EDITOR_PROPS.validationRules,
  isLoading = false,
  disabled = false,
  defaultCountry = 'Sri Lanka'
}: CSVEditorForBusStopsProps) {
  const [csvData, setCsvData] = useState<CSVData | null>(initialData || null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate data whenever it changes
  useEffect(() => {
    if (csvData && validationRules) {
      const result = validateCSVData(csvData, validationRules);
      setValidationResult(result);
      onValidationChange?.(result);
    }
  }, [csvData, validationRules, onValidationChange]);

  const handleDataParsed = useCallback((data: CSVData) => {
    setCsvData(data);
    setErrorMessage(null);
    onDataChange?.(data);
  }, [onDataChange]);

  const handleDataChanged = useCallback((data: CSVData) => {
    setCsvData(data);
    onDataChange?.(data);
  }, [onDataChange]);

  const handleError = useCallback((error: string) => {
    setErrorMessage(error);
    setImportProgress(null);
  }, []);

  const handleDownloadTemplate = useCallback(async (format: string) => {
    try {
      const templateContent = await BusStopManagementService.downloadStopImportTemplate(format);
      
      // Create and download the file
      const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bus-stops-template-${format}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError('Failed to download template');
      console.error('Template download error:', error);
    }
  }, [handleError]);

  const handleImport = useCallback(async () => {
    if (!csvData || !validationResult) {
      handleError('No data to import');
      return;
    }

    if (!validationResult.isValid) {
      handleError('Please fix validation errors before importing');
      return;
    }

    try {
      setImportProgress({
        total: csvData.rows.length,
        processed: 0,
        successful: 0,
        failed: 0,
        isImporting: true
      });

      // Convert CSV data to CSV file content
      const headers = csvData.headers.join(',');
      const rows = csvData.rows.map(row => 
        csvData.headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');

      // Create blob and form data
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      if (onImport) {
        // Use custom import handler
        await onImport(csvData);
      } else {
        // Use default BusStopManagementService
        const result = await BusStopManagementService.importStops(defaultCountry, {
          file: blob
        });

        setImportProgress({
          total: csvData.rows.length,
          processed: result.totalRecords || csvData.rows.length,
          successful: result.successfulImports || 0,
          failed: result.failedImports || 0,
          isImporting: false,
          errors: result.errors?.map((error, index) => ({
            row: index,
            message: (error as any).message || 'Unknown error'
          }))
        });

        onImportComplete?.(result);
      }

    } catch (error) {
      setImportProgress({
        total: csvData.rows.length,
        processed: 0,
        successful: 0,
        failed: csvData.rows.length,
        isImporting: false
      });

      const errorMsg = error instanceof Error ? error.message : 'Import failed';
      handleError(errorMsg);
      onImportError?.(errorMsg);
    }
  }, [csvData, validationResult, onImport, onImportComplete, onImportError, defaultCountry, handleError]);

  const canImport = csvData && validationResult?.isValid && !importProgress?.isImporting && !isLoading && !disabled;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Upload CSV Data</h3>
        </div>
        <CSVUploader
          onDataParsed={handleDataParsed}
          onError={handleError}
          maxFileSize={maxFileSize}
          disabled={disabled || isLoading}
          onDownloadTemplate={handleDownloadTemplate}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Error</h4>
              <p className="text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && csvData && (
        <div className={`rounded-lg border p-4 ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                validationResult.isValid ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Validation {validationResult.isValid ? 'Passed' : 'Issues Found'}
              </h4>
              <p className={`mt-1 ${
                validationResult.isValid ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {getValidationSummary(validationResult)}
              </p>
              
              {!validationResult.isValid && (
                <p className="text-sm text-yellow-600 mt-2">
                  Review the highlighted cells in the table below and fix the errors before importing.
                </p>
              )}
            </div>
            
            {canImport && (
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
            )}
          </div>
        </div>
      )}

      {/* Import Progress */}
      {importProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className={`w-5 h-5 mt-0.5 ${
              importProgress.isImporting 
                ? 'border-2 border-blue-600 border-t-transparent rounded-full animate-spin'
                : importProgress.failed === 0 
                  ? 'text-green-600'
                  : 'text-yellow-600'
            }`}>
              {!importProgress.isImporting && (
                importProgress.failed === 0 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">
                {importProgress.isImporting ? 'Importing...' : 'Import Complete'}
              </h4>
              <div className="text-blue-700 mt-1 space-y-1">
                <p>
                  {importProgress.successful} successful, {importProgress.failed} failed 
                  {importProgress.isImporting ? ` (${importProgress.processed}/${importProgress.total})` : ''}
                </p>
                
                {importProgress.errors && importProgress.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-700">Errors:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside mt-1">
                      {importProgress.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>Row {error.row + 1}: {error.message}</li>
                      ))}
                      {importProgress.errors.length > 5 && (
                        <li>... and {importProgress.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {csvData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Review & Edit Data</h3>
          </div>
          <CSVDataTable
            data={csvData}
            onDataChange={handleDataChanged}
            validationErrors={validationResult ? [...validationResult.errors, ...validationResult.warnings] : []}
            maxRows={maxRows}
            readOnly={disabled || isLoading}
            allowAddRows={true}
            allowDeleteRows={true}
            allowEditHeaders={false}
          />
        </div>
      )}
    </div>
  );
}