'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared/layout';
import { CSVEditor } from '@/components/tools/csv-editor';
import { CSVData } from '@/components/tools/csv-editor/types';
import { useToast } from '@/hooks/use-toast';

function BusStopsImportPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleImportComplete = useCallback((result: any) => {
        const { successfulImports = 0, failedImports = 0, totalRecords = 0 } = result;
        
        if (failedImports === 0) {
            toast({
                title: 'Import Successful',
                description: `Successfully imported ${successfulImports} bus stops.`,
                variant: 'default',
            });
        } else {
            toast({
                title: 'Import Partially Completed',
                description: `Imported ${successfulImports} bus stops successfully. ${failedImports} failed to import.`,
                variant: 'destructive',
            });
        }

        // Navigate back to bus stops list after successful import
        if (successfulImports > 0) {
            setTimeout(() => {
                router.push('/mot/bus-stops');
            }, 2000);
        }
    }, [toast, router]);

    const handleImportError = useCallback((error: string) => {
        toast({
            title: 'Import Failed',
            description: error,
            variant: 'destructive',
        });
    }, [toast]);

    return (
        <Layout
            activeItem="bus-stops"
            pageTitle="Import Bus Stops"
            pageDescription="Import bus stops in bulk using a CSV file. Download a template to see the expected format."
            role="mot"
        >
            <div className="p-0 mx-auto">
                <CSVEditor
                    onImportComplete={handleImportComplete}
                    onImportError={handleImportError}
                    maxRows={5000}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    defaultCountry="Sri Lanka"
                />
            </div>
        </Layout>
    );
}

export default BusStopsImportPage;