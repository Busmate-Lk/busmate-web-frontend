'use client';

import { useState, useEffect, useMemo } from 'react';
import { useScheduleWorkspace } from '@/context/ScheduleWorkspace/useScheduleWorkspace';
import { useToast } from '@/hooks/use-toast';
import { 
  validateScheduleYaml, 
  getScheduleYamlTemplate 
} from '@/services/scheduleWorkspaceSerializer';
import { 
  FileText, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertTriangle,
  FileCode,
  RefreshCw,
} from 'lucide-react';

export default function ScheduleTextualMode() {
  const { data, route, getYaml, updateFromYaml } = useScheduleWorkspace();
  const { toast } = useToast();
  
  const [yamlText, setYamlText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync context data to textarea when form changes
  useEffect(() => {
    if (!isSyncing) {
      setYamlText(getYaml());
      setValidationErrors([]);
    }
  }, [data, getYaml, isSyncing]);

  // Handle textarea changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setYamlText(newText);

    // Validate YAML
    const validation = validateScheduleYaml(newText);
    setValidationErrors(validation.errors);
  };

  // Apply changes to context
  const handleApplyChanges = () => {
    const validation = validateScheduleYaml(yamlText);
    
    if (!validation.valid) {
      toast({
        title: 'Invalid YAML',
        description: `Found ${validation.errors.length} error(s). Please fix them before applying.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    const success = updateFromYaml(yamlText);
    setIsSyncing(false);

    if (success) {
      toast({
        title: 'Changes Applied',
        description: 'YAML changes have been applied to the workspace',
      });
    } else {
      toast({
        title: 'Failed to Apply',
        description: 'Could not parse the YAML. Please check the format.',
        variant: 'destructive',
      });
    }
  };

  // Reset to current context state
  const handleReset = () => {
    setYamlText(getYaml());
    setValidationErrors([]);
    toast({
      title: 'Reset',
      description: 'YAML has been reset to current workspace state',
    });
  };

  // Load template
  const handleLoadTemplate = () => {
    if (route) {
      const template = getScheduleYamlTemplate(route.id, route.name);
      setYamlText(template);
      setValidationErrors([]);
      toast({
        title: 'Template Loaded',
        description: 'A sample YAML template has been loaded',
      });
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied',
        description: 'YAML copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Download as file
  const handleDownload = () => {
    const blob = new Blob([yamlText], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedules-${route?.name || 'export'}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: 'YAML file has been downloaded',
    });
  };

  // Upload file
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        setYamlText(text);
        
        const validation = validateScheduleYaml(text);
        setValidationErrors(validation.errors);
        
        toast({
          title: 'File Loaded',
          description: `Loaded ${file.name}${validation.errors.length > 0 ? ` with ${validation.errors.length} error(s)` : ''}`,
          variant: validation.errors.length > 0 ? 'destructive' : 'default',
        });
      }
    };
    input.click();
  };

  const lineCount = yamlText.split('\n').length;
  const hasChanges = yamlText !== getYaml();

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileCode className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Textual Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              Edit schedules in YAML format. Changes will be applied when you click "Apply Changes".
              You can also copy/paste schedule data or upload/download YAML files.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadTemplate}
            disabled={!route}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            Load Template
          </button>
          <button
            onClick={handleUpload}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleApplyChanges}
            disabled={validationErrors.length > 0}
            className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800">Validation Errors</h4>
              <ul className="mt-2 space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* YAML Editor */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-mono">schedules.yaml</span>
          <span className="text-xs text-gray-500">{lineCount} lines</span>
        </div>
        <div className="relative">
          {/* Line numbers */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r text-right pr-2 pt-4 font-mono text-xs text-gray-400 select-none overflow-hidden">
            {yamlText.split('\n').map((_, idx) => (
              <div key={idx} style={{ lineHeight: '1.5rem' }}>{idx + 1}</div>
            ))}
          </div>
          
          {/* Editor */}
          <textarea
            value={yamlText}
            onChange={handleTextChange}
            className="w-full h-[600px] pl-14 pr-4 py-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            style={{ lineHeight: '1.5rem' }}
            spellCheck={false}
            placeholder="# Enter schedule YAML here or load a template"
          />
        </div>
      </div>

      {/* Help section */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">YAML Format Reference</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium mb-1">Required Fields:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="bg-gray-200 px-1 rounded">name</code> - Schedule name</li>
              <li><code className="bg-gray-200 px-1 rounded">schedule_type</code> - REGULAR or SPECIAL</li>
              <li><code className="bg-gray-200 px-1 rounded">effective_start_date</code> - YYYY-MM-DD</li>
              <li><code className="bg-gray-200 px-1 rounded">calendar</code> - Operating days</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Time Format:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Use 24-hour format: <code className="bg-gray-200 px-1 rounded">HH:mm:ss</code></li>
              <li>Example: <code className="bg-gray-200 px-1 rounded">06:30:00</code></li>
            </ul>
            <p className="font-medium mb-1 mt-2">Date Format:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>ISO format: <code className="bg-gray-200 px-1 rounded">YYYY-MM-DD</code></li>
              <li>Example: <code className="bg-gray-200 px-1 rounded">2026-01-15</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
