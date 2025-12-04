'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Edit3, Trash2, Plus, Check, X, AlertTriangle, Info } from 'lucide-react';
import { CSVData, CSVRow, ValidationError } from './types';

interface CSVDataTableProps {
  data: CSVData;
  onDataChange: (data: CSVData) => void;
  validationErrors?: ValidationError[];
  maxRows?: number;
  readOnly?: boolean;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  allowEditHeaders?: boolean;
}

export function CSVDataTable({
  data,
  onDataChange,
  validationErrors = [],
  maxRows = 1000,
  readOnly = false,
  allowAddRows = true,
  allowDeleteRows = true,
  allowEditHeaders = false
}: CSVDataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Create error map for quick lookup
  const errorMap = useMemo(() => {
    const map = new Map<string, ValidationError[]>();
    validationErrors.forEach(error => {
      const key = `${error.row}-${error.column}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(error);
    });
    return map;
  }, [validationErrors]);

  const getCellErrors = useCallback((rowIndex: number, column: string) => {
    return errorMap.get(`${rowIndex}-${column}`) || [];
  }, [errorMap]);

  const getCellErrorSeverity = useCallback((rowIndex: number, column: string) => {
    const errors = getCellErrors(rowIndex, column);
    if (errors.some(e => e.severity === 'error')) return 'error';
    if (errors.some(e => e.severity === 'warning')) return 'warning';
    return null;
  }, [getCellErrors]);

  const startEditing = useCallback((rowIndex: number, column: string, currentValue: any) => {
    if (readOnly) return;
    setEditingCell({ row: rowIndex, column });
    setEditValue(String(currentValue || ''));
  }, [readOnly]);

  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingCell) return;

    const newRows = [...data.rows];
    const { row, column } = editingCell;
    
    // Convert value based on column type
    let processedValue: string | number | boolean = editValue;
    
    // Handle boolean fields
    if (column === 'isAccessible') {
      const lowerValue = editValue.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        processedValue = true;
      } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        processedValue = false;
      }
    }
    // Handle numeric fields
    else if (column === 'latitude' || column === 'longitude') {
      const num = parseFloat(editValue);
      if (!isNaN(num)) {
        processedValue = num;
      }
    }
    
    newRows[row] = { ...newRows[row], [column]: processedValue };
    
    onDataChange({
      ...data,
      rows: newRows
    });

    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, data, onDataChange]);

  const addRow = useCallback(() => {
    if (readOnly || data.rows.length >= maxRows) return;

    const newRow: CSVRow = {};
    data.headers.forEach(header => {
      newRow[header] = '';
    });

    onDataChange({
      ...data,
      rows: [...data.rows, newRow]
    });
  }, [readOnly, data, maxRows, onDataChange]);

  const deleteRow = useCallback((rowIndex: number) => {
    if (readOnly) return;

    const newRows = data.rows.filter((_, index) => index !== rowIndex);
    onDataChange({
      ...data,
      rows: newRows
    });
  }, [readOnly, data, onDataChange]);

  const addColumn = useCallback((headerName: string) => {
    if (readOnly || !allowEditHeaders) return;

    const newHeaders = [...data.headers, headerName];
    const newRows = data.rows.map(row => ({ ...row, [headerName]: '' }));

    onDataChange({
      headers: newHeaders,
      rows: newRows
    });
  }, [readOnly, allowEditHeaders, data, onDataChange]);

  const deleteColumn = useCallback((columnName: string) => {
    if (readOnly || !allowEditHeaders) return;

    const newHeaders = data.headers.filter(h => h !== columnName);
    const newRows = data.rows.map(row => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });

    onDataChange({
      headers: newHeaders,
      rows: newRows
    });
  }, [readOnly, allowEditHeaders, data, onDataChange]);

  const formatCellValue = useCallback((value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  }, []);

  const getCellClassName = useCallback((rowIndex: number, column: string) => {
    const severity = getCellErrorSeverity(rowIndex, column);
    const baseClasses = 'px-3 py-2 text-sm border-r border-gray-200 last:border-r-0';
    
    if (severity === 'error') {
      return `${baseClasses} bg-red-50 border-red-200`;
    } else if (severity === 'warning') {
      return `${baseClasses} bg-yellow-50 border-yellow-200`;
    }
    
    return `${baseClasses} hover:bg-gray-50`;
  }, [getCellErrorSeverity]);

  if (data.rows.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">No data to display</h3>
            <p className="text-gray-600">Upload a CSV file or paste CSV content to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>{data.rows.length} rows × {data.headers.length} columns</span>
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">{validationErrors.length} validation issues</span>
            </div>
          )}
        </div>
        
        {!readOnly && allowAddRows && data.rows.length < maxRows && (
          <button
            onClick={addRow}
            className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-300 hover:border-blue-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {!readOnly && allowDeleteRows && (
                <th className="w-8 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  #
                </th>
              )}
              {data.headers.map((header, index) => (
                <th
                  key={header}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-32"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{header}</span>
                    {!readOnly && allowEditHeaders && (
                      <button
                        onClick={() => deleteColumn(header)}
                        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-gray-25">
                {!readOnly && allowDeleteRows && (
                  <td className="w-8 px-2 py-2 text-center border-r border-gray-200">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                )}
                {data.headers.map((header) => {
                  const cellValue = row[header];
                  const isEditing = editingCell?.row === rowIndex && editingCell?.column === header;
                  const cellErrors = getCellErrors(rowIndex, header);
                  
                  return (
                    <td key={header} className={getCellClassName(rowIndex, header)}>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-1 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="group relative">
                          <div
                            className={`cursor-text min-h-5 ${!readOnly ? 'hover:bg-gray-100 rounded px-1 py-1' : ''}`}
                            onClick={() => startEditing(rowIndex, header, cellValue)}
                          >
                            <span className="truncate block">
                              {formatCellValue(cellValue) || <span className="text-gray-400 italic">empty</span>}
                            </span>
                          </div>
                          
                          {cellErrors.length > 0 && (
                            <div className="absolute right-1 top-1 group">
                              <AlertTriangle className={`w-3 h-3 ${cellErrors.some(e => e.severity === 'error') ? 'text-red-500' : 'text-yellow-500'}`} />
                              <div className="absolute right-0 top-5 bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-20 w-48 hidden group-hover:block">
                                {cellErrors.map((error, idx) => (
                                  <div key={idx} className="mb-1 last:mb-0">
                                    {error.message}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {validationErrors.length > 0 && (
        <div className="flex items-start gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Error</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-500" />
            <span>Hover over error icons to see details</span>
          </div>
        </div>
      )}
    </div>
  );
}