'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { parseFile, FileParseResult } from '@/utils/parseFile';
import ColumnMapper from '@/components/ColumnMapper';
import ResultTable from '@/components/ResultTable';
import toast from 'react-hot-toast';

interface EnrichmentRequest {
  requestId: string;
  fileName: string;
  sheetName?: string;
  recordCount: number;
  enrichmentType: 'email' | 'phone' | 'both';
}

interface EnrichmentResult {
  first_name?: string;
  last_name?: string;
  company?: string;
  company_domain?: string;
  linkedin_url?: string;
  email_address?: string;
  phone_number?: string;
  workflow?: string;
}

export default function FileEnrichmentPage() {
  const [enrichmentType, setEnrichmentType] = useState<'email' | 'phone' | 'both'>('email');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<FileParseResult | FileParseResult[] | null>(null);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState<EnrichmentRequest[]>([]);
  const [results, setResults] = useState<EnrichmentResult[]>([]);
  const [pollingIntervals, setPollingIntervals] = useState<Record<string, NodeJS.Timeout>>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const parsed = await parseFile(selectedFile);
      setParsedData(parsed);
      setCurrentSheetIndex(0);
      setColumnMapping({});
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to parse file. Please check the format.');
      console.error('File parsing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentSheet = (): FileParseResult | null => {
    if (!parsedData) return null;
    
    if (Array.isArray(parsedData)) {
      return parsedData[currentSheetIndex] || null;
    }
    
    return parsedData;
  };

  const handleStartEnrichment = async () => {
    const currentSheet = getCurrentSheet();
    if (!currentSheet) return;

    // Validate mapping
    const requiredFields = {
      email: ['first_name', 'last_name', 'company'],
      phone: ['linkedin_url'],
      both: ['first_name', 'last_name', 'company', 'linkedin_url']
    };

    const missingFields = requiredFields[enrichmentType].filter(
      field => !columnMapping[field]
    );

    if (missingFields.length > 0) {
      toast.error(`Please map all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for API
      const enrichedData = currentSheet.rows.map(row => {
        const data: any = {};
        Object.entries(columnMapping).forEach(([field, column]) => {
          if (column && row[column]) {
            data[field] = row[column];
          }
        });
        return data;
      }).filter(item => Object.keys(item).length > 0);

      if (enrichedData.length === 0) {
        throw new Error('No valid data found after mapping');
      }

      const response = await fetch('/api/enrich/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: enrichedData,
          enrich_email: enrichmentType === 'email' || enrichmentType === 'both',
          enrich_phone: enrichmentType === 'phone' || enrichmentType === 'both',
          fileName: currentSheet.fileName,
          sheetName: currentSheet.sheetName
        })
      });

      const result = await response.json();

      if (response.ok && result.request_id) {
        const newRequest: EnrichmentRequest = {
          requestId: result.request_id,
          fileName: currentSheet.fileName,
          sheetName: currentSheet.sheetName,
          recordCount: enrichedData.length,
          enrichmentType
        };

        setActiveRequests(prev => [...prev, newRequest]);
        toast.success(`Enrichment started for ${enrichedData.length} records!`);
        startPolling(result.request_id, currentSheet.fileName, currentSheet.sheetName);
      } else {
        throw new Error(result.error || 'Failed to start enrichment');
      }
    } catch (error) {
      toast.error('Failed to start enrichment process');
      console.error('Enrichment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (requestId: string, fileName: string, sheetName?: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/enrich/results?requestId=${requestId}`);
        const data = await response.json();

        if (data.status === 'terminated') {
          clearInterval(interval);
          
          // Remove from active requests
          setActiveRequests(prev => prev.filter(req => req.requestId !== requestId));
          
          // Remove polling interval
          setPollingIntervals(prev => {
            const newIntervals = { ...prev };
            delete newIntervals[requestId];
            return newIntervals;
          });

          if (data.data && data.data.length > 0) {
            // Add workflow info to results
            const enrichedResults = data.data.map((item: any) => ({
              ...item,
              workflow: sheetName || fileName
            }));
            
            setResults(prev => [...prev, ...enrichedResults]);
            toast.success(`Enrichment completed for ${fileName}${sheetName ? ` - ${sheetName}` : ''}!`);
          } else {
            toast.error(`No results found for ${fileName}${sheetName ? ` - ${sheetName}` : ''}`);
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setActiveRequests(prev => prev.filter(req => req.requestId !== requestId));
          setPollingIntervals(prev => {
            const newIntervals = { ...prev };
            delete newIntervals[requestId];
            return newIntervals;
          });
          toast.error(`Enrichment failed for ${fileName}${sheetName ? ` - ${sheetName}` : ''}`);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds

    setPollingIntervals(prev => ({ ...prev, [requestId]: interval }));
  };

  useEffect(() => {
    return () => {
      // Cleanup all polling intervals
      Object.values(pollingIntervals).forEach(interval => clearInterval(interval));
    };
  }, [pollingIntervals]);

  const currentSheet = getCurrentSheet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold gradient-text mb-4">📁 File Enrichment</h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Upload CSV or XLSX files to bulk enrich leads with phone numbers and email addresses.
            </p>
          </div>
        </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload and Configuration */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-gray-600 mb-2">
                  {isLoading ? 'Processing file...' : 'Click to upload or drag and drop'}
                </div>
                <div className="text-sm text-gray-500">
                  CSV, XLSX, or XLS files only
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-green-900">{file.name}</div>
                    <div className="text-sm text-green-700">
                      {Array.isArray(parsedData) ? `${parsedData.length} sheet(s)` : '1 sheet'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enrichment Type Selection */}
          {file && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrichment Type</h3>
              <div className="space-y-3">
                {[
                  { value: 'email', label: 'Email Address (1 credit per record)', description: 'First name, Last name, Company name or Domain' },
                  { value: 'phone', label: 'Phone Number (10 credits per record)', description: 'LinkedIn profile URL' },
                  { value: 'both', label: 'Both Email & Phone (11 credits per record)', description: 'All fields above' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start">
                    <input
                      type="radio"
                      name="enrichmentType"
                      value={option.value}
                      checked={enrichmentType === option.value}
                      onChange={(e) => setEnrichmentType(e.target.value as 'email' | 'phone' | 'both')}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sheet Selection (for XLSX files) */}
          {Array.isArray(parsedData) && parsedData.length > 1 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Sheet</h3>
              <select
                value={currentSheetIndex}
                onChange={(e) => setCurrentSheetIndex(Number(e.target.value))}
                className="input-field"
              >
                {parsedData.map((sheet, index) => (
                  <option key={index} value={index}>
                    {sheet.sheetName || `Sheet ${index + 1}`} ({sheet.rows.length} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Column Mapping */}
          {currentSheet && (
            <ColumnMapper
              headers={currentSheet.headers}
              mapping={columnMapping}
              onMappingChange={setColumnMapping}
              enrichmentType={enrichmentType}
            />
          )}

          {/* Start Enrichment Button */}
          {currentSheet && (
            <button
              onClick={handleStartEnrichment}
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Start Enrichment (${currentSheet.rows.length} records)`
              )}
            </button>
          )}
        </div>

        {/* Results and Status */}
        <div className="space-y-6">
          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Enrichments</h3>
              <div className="space-y-3">
                {activeRequests.map((request) => (
                  <div key={request.requestId} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Loader2 className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        {request.fileName}{request.sheetName && ` - ${request.sheetName}`}
                      </div>
                      <div className="text-sm text-blue-700">
                        {request.recordCount} records • {request.enrichmentType} enrichment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <ResultTable results={results} />
          )}
        </div>
      </div>
    </div>
    </div>
  );
} 