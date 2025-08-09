'use client'

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, CheckCircle, Eye, Download, X, Search } from 'lucide-react';
import { parseFile, FileParseResult } from '@/utils/parseFile';
import ColumnMapper from '@/components/ColumnMapper';
import ResultTable from '@/components/ResultTable';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getUserEnrichmentRequests, getEnrichmentResults } from '@/lib/database';

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
  contact_email_address?: string;
  contact_phone_number?: string;
  workflow?: string;
}

export default function FileEnrichmentPage() {
  const { user } = useAuth();
  const [enrichmentType, setEnrichmentType] = useState<'email' | 'phone' | 'both'>('email');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<FileParseResult | FileParseResult[] | null>(null);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState<EnrichmentRequest[]>([]);
  const [results, setResults] = useState<EnrichmentResult[]>([]);
  const [pollingIntervals, setPollingIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [fileHistory, setFileHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalResults, setModalResults] = useState<EnrichmentResult[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalEnrichmentType, setModalEnrichmentType] = useState<'email' | 'phone' | 'both'>('both');
  const [currentRequestId, setCurrentRequestId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      console.log('👤 User authenticated, fetching file history for:', user.id);
      fetchFileHistory();
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (loadingHistory) {
          setLoadingHistory(false);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      console.log('❌ No user found, skipping file history fetch');
      setLoadingHistory(false);
    }
  }, [user]);

  // Auto-refresh file history every 30 seconds to show status updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchFileHistory();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchFileHistory = async () => {
    if (!user) return;

    try {
      console.log('🔍 Fetching file history for user:', user.id);
      const { data: requests, error } = await getUserEnrichmentRequests(user.id);
      
      if (error) {
        console.error('❌ Error fetching file history:', error);
        toast.error('Failed to load file history');
        setFileHistory([]);
      } else if (requests) {
        console.log('✅ Found requests:', requests.length);
        const fileRequests = requests.filter(req => req.request_type === 'file');
        console.log('✅ File requests:', fileRequests.length);
        setFileHistory(fileRequests);
      } else {
        console.log('ℹ️ No requests found');
        setFileHistory([]);
      }
    } catch (error) {
      console.error('❌ Exception in fetchFileHistory:', error);
      toast.error('Failed to load file history');
      setFileHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredFileHistory = fileHistory.filter(request => {
    if (!searchTerm) return true;
    
    const fileName = request.input_data?.fileName?.toLowerCase() || '';
    const requestId = request.request_id?.toLowerCase() || '';
    const status = request.status?.toLowerCase() || '';
    const enrichmentType = request.enrichment_type?.toLowerCase() || '';
    
    return fileName.includes(searchTerm.toLowerCase()) ||
           requestId.includes(searchTerm.toLowerCase()) ||
           status.includes(searchTerm.toLowerCase()) ||
           enrichmentType.includes(searchTerm.toLowerCase());
  });

  const handleViewDetails = async (requestId: string) => {
    console.log('🔍 View Details clicked for request ID:', requestId);
    setCurrentRequestId(requestId);
    setShowModal(true);
    setModalLoading(true);
    setModalResults([]);
    
    try {
      // First, get the enrichment request details to determine the type
      const { data: request, error: requestError } = await supabase
        .from('enrichment_requests')
        .select('enrichment_type')
        .eq('request_id', requestId)
        .single();

      if (requestError) {
        console.error('❌ Error fetching request details:', requestError);
        setModalEnrichmentType('both'); // Default to both
      } else {
        console.log('📊 Request enrichment type:', request.enrichment_type);
        setModalEnrichmentType(request.enrichment_type as 'email' | 'phone' | 'both');
      }

      console.log('📡 Fetching results from database...');
      const { data: results, error } = await getEnrichmentResults(requestId);
      
      console.log('📊 Database response:', { results, error });
      
      if (error) {
        console.error('❌ Database error:', error);
        toast.error('Failed to load results: ' + (error as any).message);
      } else if (results && results.length > 0) {
        console.log('✅ Found', results.length, 'results');
        setModalResults(results);
        toast.success('Results loaded successfully!');
      } else {
        console.log('ℹ️ No results found in database');
        toast("Your request is still being processed. We know waiting can be frustrating, but hang tight—your results will appear here as soon as they're ready!");
      }
    } catch (error) {
      console.error('❌ Exception in handleViewDetails:', error);
      toast.error('Failed to load results');
    } finally {
      setModalLoading(false);
    }
  };

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
          sheetName: currentSheet.sheetName,
          userId: user?.id
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
      } else if (response.status === 402 && result.error === 'Insufficient credits') {
        // Handle credit error specifically
        const details = result.details;
        toast.error(`❌ Insufficient credits: ${details.message}`, {
          duration: 6000
        });
        console.error('Credit error:', result);
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
            // Refresh the file history to show updated status
            fetchFileHistory();
          } else {
            toast.error(`No results found for ${fileName}${sheetName ? ` - ${sheetName}` : ''}`);
            // Refresh history to show failed status
            fetchFileHistory();
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
          // Refresh history to show failed status
          fetchFileHistory();
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
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">File Enrichment</h1>
        <p className="text-gray-600 mt-2">
          Upload CSV or XLSX files to bulk enrich leads with phone numbers and email addresses.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload and Configuration */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📁 Upload File</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
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
                <div className="text-gray-600 mb-2 font-medium">
                  {isLoading ? 'Processing file...' : 'Click to upload or drag and drop'}
                </div>
                <div className="text-sm text-gray-500">
                  CSV, XLSX, or XLS files only (Max 10MB)
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gradient-to-r from-success-50 to-green-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-green-900">{file.name}</div>
                    <div className="text-sm text-green-700">
                      {Array.isArray(parsedData) ? `${parsedData.length} sheet(s)` : '1 sheet'} • 
                      {currentSheet ? ` ${currentSheet.rows.length} rows` : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enrichment Type Selection */}
          {file && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Enrichment Type</h3>
              <div className="space-y-3">
                {[
                  { value: 'email', label: 'Email Address (1 credit per email found)', description: 'First name, Last name, Company name or Domain', color: 'from-success-500 to-success-600' },
                  { value: 'phone', label: 'Phone Number (10 credits per phone found)', description: 'LinkedIn profile URL', color: 'from-warning-500 to-warning-600' },
                  { value: 'both', label: 'Both Email & Phone (1-11 credits per record)', description: 'All fields above - credits based on actual results', color: 'from-accent-500 to-accent-600' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="enrichmentType"
                      value={option.value}
                      checked={enrichmentType === option.value}
                      onChange={(e) => setEnrichmentType(e.target.value as 'email' | 'phone' | 'both')}
                      className="mt-1 mr-3 text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.color} mr-2`}></div>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500 ml-5">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sheet Selection (for XLSX files) */}
          {Array.isArray(parsedData) && parsedData.length > 1 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Select Sheet</h3>
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

          {/* Credit Calculation */}
          {currentSheet && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    Credit Calculation
                  </div>
                  <div className="text-sm text-blue-700">
                    {enrichmentType === 'email' && `${currentSheet.rows.length} records × 1 credit per email found`}
                    {enrichmentType === 'phone' && `${currentSheet.rows.length} records × 10 credits per phone found`}
                    {enrichmentType === 'both' && `${currentSheet.rows.length} records × 1-11 credits per record (based on results)`}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {enrichmentType === 'both' && '• Email only: 1 credit • Phone only: 10 credits • Both: 11 credits'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-900">
                    Credits only deducted for successful enrichments
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Start Enrichment Button */}
          {currentSheet && (
            <button
              onClick={handleStartEnrichment}
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg py-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span className="ml-2">Start Enrichment ({currentSheet.rows.length} records)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Results and Status */}
        <div className="space-y-6">
          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⏳ Active Enrichments</h3>
              <div className="space-y-3">
                {activeRequests.map((request) => (
                  <div key={request.requestId} className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary-900">
                        {request.fileName}{request.sheetName && ` - ${request.sheetName}`}
                      </div>
                      <div className="text-sm text-primary-700">
                        {request.recordCount} records • {request.enrichmentType} enrichment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File History */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📁 File History</h3>
              {fileHistory.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              )}
            </div>
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading file history...</p>
              </div>
            ) : fileHistory.length > 0 ? (
              <>
                {filteredFileHistory.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {filteredFileHistory.map((request) => (
                      <div key={request.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 mr-4">
                          <div className="p-2 bg-accent-100 text-accent-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {request.input_data?.fileName || 'File Upload'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.input_data?.data?.length || 0} records • {request.enrichment_type} enrichment • {request.status === 'completed' ? 'Done' : request.status}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(request.created_at).toLocaleDateString()} • {request.status}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(request.request_id)}
                            className="btn-secondary text-sm py-2 px-3 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm ? `No results found for "${searchTerm}"` : 'No file enrichment history'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No file enrichment history</p>
              </div>
            )}
          </div>

          {/* Results */}
          {/* {results.length > 0 && (
            <ResultTable results={results} />
          )} */}

          {/* Help */}
          {!file && (
            <div className="card bg-gradient-to-r from-primary-50 to-accent-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Your CSV/Excel file should have headers in the first row</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Include LinkedIn URLs for better phone number matching</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-success-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Company domain helps improve email accuracy</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Enrichment Results</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {modalLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading results...</p>
                </div>
              ) : modalResults.length > 0 ? (
                <ResultTable results={modalResults} enrichmentType={modalEnrichmentType} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No results found for this request</p>
                  <p className="text-sm text-gray-400 mb-4">The enrichment may still be processing or results haven't been saved yet.</p>
                  <button
                    onClick={async () => {
                      setModalLoading(true);
                      try {
                        // Try to fetch from BetterContact API directly
                        const response = await fetch(`/api/enrich/results?requestId=${currentRequestId}`);
                        const data = await response.json();
                        
                        if (data.status === 'terminated' && data.data && data.data.length > 0) {
                          setModalResults(data.data);
                          toast.success('Results fetched successfully!');
                        } else {
                          toast.error('No results available yet. Please try again later.');
                        }
                      } catch (error) {
                        toast.error('Failed to fetch results');
                      } finally {
                        setModalLoading(false);
                      }
                    }}
                    className="btn-primary"
                  >
                    🔄 Try Fetching Results
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 