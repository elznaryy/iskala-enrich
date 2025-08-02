'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Eye, History, Clock, X } from 'lucide-react';
import InputField from '@/components/InputField';
import ResultTable from '@/components/ResultTable';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getUserEnrichmentRequests, getEnrichmentResults } from '@/lib/database';

interface EnrichmentForm {
  first_name: string;
  last_name: string;
  company: string;
  company_domain: string;
  linkedin_url: string;
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
  source?: string;
  enriched?: boolean;
}

export default function IndividualEnrichmentPage() {
  const { user } = useAuth();
  const [enrichmentType, setEnrichmentType] = useState<'email' | 'phone' | 'both'>('email');
  const [form, setForm] = useState<EnrichmentForm>({
    first_name: '',
    last_name: '',
    company: '',
    company_domain: '',
    linkedin_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [results, setResults] = useState<EnrichmentResult[]>([]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lookupHistory, setLookupHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalResults, setModalResults] = useState<EnrichmentResult[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLookupHistory();
    }
  }, [user]);

  // Auto-refresh lookup history every 30 seconds to show status updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchLookupHistory();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchLookupHistory = async () => {
    if (!user) {
      console.log('No user found, skipping lookup history');
      setLoadingHistory(false);
      return;
    }

    console.log('Fetching lookup history for user:', user.id);
    
    try {
      const { data: requests, error } = await getUserEnrichmentRequests(user.id);
      
      if (error) {
        console.error('Error fetching lookup history:', error);
        setLookupHistory([]);
      } else if (requests) {
        console.log('Found', requests.length, 'total requests');
        const individualRequests = requests.filter(req => req.request_type === 'individual');
        console.log('Found', individualRequests.length, 'individual requests');
        setLookupHistory(individualRequests);
      } else {
        console.log('No requests found');
        setLookupHistory([]);
      }
    } catch (error) {
      console.error('Error in fetchLookupHistory:', error);
      setLookupHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewDetails = async (requestId: string) => {
    console.log('🔍 View Details clicked for request ID:', requestId);
    setShowModal(true);
    setModalLoading(true);
    setModalResults([]);
    
    try {
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
        toast.error('No results found for this request. The enrichment may still be processing.');
      }
    } catch (error) {
      console.error('❌ Exception in handleViewDetails:', error);
      toast.error('Failed to load results');
    } finally {
      setModalLoading(false);
    }
  };

  const requiredFields = {
    email: ['first_name', 'last_name', 'company'],
    phone: ['linkedin_url'],
    both: ['first_name', 'last_name', 'company', 'linkedin_url']
  };

  const isFormValid = () => {
    const fields = requiredFields[enrichmentType];
    return fields.every(field => form[field as keyof EnrichmentForm]?.trim());
  };

  const handleFormChange = (field: keyof EnrichmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const startPolling = (id: string) => {
    let attempts = 0;
    const maxAttempts = 12; // 2 minutes total (12 * 10 seconds)
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/enrich/results?requestId=${id}`);
        const data = await response.json();

        console.log(`🔍 Polling attempt ${attempts}/${maxAttempts}:`, data);

        if (data.status === 'terminated') {
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          
          if (data.data && data.data.length > 0) {
            setResults(data.data);
            toast.success('🎉 Enrichment completed successfully!');
            // Refresh the lookup history to show updated status
            fetchLookupHistory();
          } else {
            toast.error('No results found');
            // Still refresh history to show failed status
            fetchLookupHistory();
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          toast.error('❌ Enrichment failed');
          // Refresh history to show failed status
          fetchLookupHistory();
        } else if (attempts >= maxAttempts) {
          // Max attempts reached - switch to manual mode
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          
          toast.error('⏰ Automatic polling timed out. Use manual entry below.', {
            duration: 4000
          });
          // Refresh history to show current status
          fetchLookupHistory();
        }
      } catch (error) {
        console.error('Polling error:', error);
        
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          toast.error('❌ Failed to retrieve results. Use manual entry below.');
          // Refresh history even on error
          fetchLookupHistory();
        }
      }
    }, 10000); // Poll every 10 seconds

    setPollingInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/enrich/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [form],
          enrich_email: enrichmentType === 'email' || enrichmentType === 'both',
          enrich_phone: enrichmentType === 'phone' || enrichmentType === 'both',
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok && data.request_id) {
        setRequestId(data.request_id);
        toast.success('🚀 Enrichment request submitted successfully!', {
          duration: 4000
        });
        startPolling(data.request_id);
      } else if (response.status === 402 && data.error === 'Insufficient credits') {
        // Handle credit error specifically
        setIsLoading(false);
        const details = data.details;
        toast.error(`❌ Insufficient credits: ${details.message}`, {
          duration: 6000
        });
        console.error('Credit error:', data);
      } else {
        throw new Error(data.error || 'Failed to start enrichment');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to start enrichment process');
      console.error('Enrichment error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Individual Lookup</h1>
        <p className="text-gray-600 mt-2">
          Enrich individual contacts with email addresses and phone numbers using AI-powered data sources.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card-gradient">
          <h2 className="text-2xl font-bold gradient-text mb-8">✨ Enrichment Details</h2>
          
          {/* Enrichment Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to enrich?
            </label>
            <div className="space-y-3">
              {[
                { value: 'email', label: 'Email Address (1 credit)', description: 'First name, Last name, Company name or Domain' },
                { value: 'phone', label: 'Phone Number (10 credits)', description: 'LinkedIn profile URL' },
                { value: 'both', label: 'Both Email & Phone (11 credits)', description: 'All fields above' }
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
                  <div>
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {(enrichmentType === 'email' || enrichmentType === 'both') && (
              <>
                <InputField
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={(value) => handleFormChange('first_name', value)}
                  placeholder="Enter first name"
                  required={true}
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={(value) => handleFormChange('last_name', value)}
                  placeholder="Enter last name"
                  required={true}
                />
                <InputField
                  label="Company Name"
                  name="company"
                  value={form.company}
                  onChange={(value) => handleFormChange('company', value)}
                  placeholder="Enter company name"
                  required={true}
                />
                <InputField
                  label="Company Domain"
                  name="company_domain"
                  value={form.company_domain}
                  onChange={(value) => handleFormChange('company_domain', value)}
                  placeholder="e.g., company.com"
                />
              </>
            )}

            {(enrichmentType === 'phone' || enrichmentType === 'both') && (
              <InputField
                label="LinkedIn URL"
                name="linkedin_url"
                value={form.linkedin_url}
                onChange={(value) => handleFormChange('linkedin_url', value)}
                placeholder="https://linkedin.com/in/username"
                type="url"
                required={true}
              />
            )}

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg py-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Processing Your Request...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span className="ml-2">Start Enrichment</span>
                </>
              )}
            </button>
          </form>

          {/* Status */}
          {isLoading && (
            <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-primary-900 mb-1">🔍 Enrichment in progress...</div>
                  <div className="text-primary-700">We're searching our database for the best contact information. This usually takes 1-2 minutes.</div>
                  {requestId && (
                    <div className="mt-2 text-sm text-primary-600">
                      Request ID: <span className="font-mono bg-white px-2 py-1 rounded">{requestId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Result Entry */}
          {requestId && !isLoading && results.length === 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-warning-50 to-orange-50 rounded-2xl border border-warning-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-warning-900 mb-4">📊 Check Results Manually</h3>
                <p className="text-warning-700 mb-6">
                  You can view your enrichment results in the external data provider dashboard and add them here
                </p>
                
                <div className="space-y-4">
                  <div className="text-sm text-warning-600">
                    Request ID: <span className="font-mono bg-white px-2 py-1 rounded">{requestId}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a 
                      href="https://app.bettercontact.rocks" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary inline-block"
                    >
                      🔗 Open Data Provider Dashboard
                    </a>
                    
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        toast.success('🔄 Retrying automatic polling...');
                        startPolling(requestId);
                      }}
                      className="btn-primary"
                    >
                      🔄 Retry Auto-Polling
                    </button>
                    
                    <button
                      onClick={() => {
                        const enrichmentTypeText = enrichmentType === 'email' ? 'email address' : 
                                                  enrichmentType === 'phone' ? 'phone number' : 
                                                  'email and phone number';
                        
                        if (enrichmentType === 'email') {
                          const email = prompt(`Found the email address in the data provider dashboard? Paste it here:\n\nRequest ID: ${requestId}\nName: ${form.first_name} ${form.last_name}\nCompany: ${form.company}`);
                          if (email && email.trim()) {
                            const manualResult = [{
                              first_name: form.first_name,
                              last_name: form.last_name,
                              company: form.company,
                              company_domain: form.company_domain,
                              linkedin_url: form.linkedin_url,
                              contact_email_address: email.trim(),
                              enriched: true,
                              source: 'manual_entry'
                            }];
                            setResults(manualResult);
                            toast.success('✅ Email added successfully!');
                          }
                        } else if (enrichmentType === 'phone') {
                          const phone = prompt(`Found the phone number in the data provider dashboard? Paste it here:\n\nRequest ID: ${requestId}\nName: ${form.first_name} ${form.last_name}\nLinkedIn: ${form.linkedin_url}`);
                          if (phone && phone.trim()) {
                            const manualResult = [{
                              first_name: form.first_name,
                              last_name: form.last_name,
                              company: form.company,
                              company_domain: form.company_domain,
                              linkedin_url: form.linkedin_url,
                              contact_phone_number: phone.trim(),
                              enriched: true,
                              source: 'manual_entry'
                            }];
                            setResults(manualResult);
                            toast.success('✅ Phone number added successfully!');
                          }
                        } else {
                          // Both email and phone
                          const email = prompt(`Found the email address in the data provider dashboard? Paste it here:\n\nRequest ID: ${requestId}\nName: ${form.first_name} ${form.last_name}\nCompany: ${form.company}`);
                          if (email && email.trim()) {
                            const phone = prompt(`Great! Now paste the phone number:\n\nRequest ID: ${requestId}\nEmail found: ${email}`);
                            const manualResult = [{
                              first_name: form.first_name,
                              last_name: form.last_name,
                              company: form.company,
                              company_domain: form.company_domain,
                              linkedin_url: form.linkedin_url,
                              contact_email_address: email.trim(),
                              contact_phone_number: phone && phone.trim() ? phone.trim() : 'Not found',
                              enriched: true,
                              source: 'manual_entry'
                            }];
                            setResults(manualResult);
                            toast.success('✅ Results added successfully!');
                          }
                        }
                      }}
                      className="btn-accent"
                    >
                      {enrichmentType === 'email' ? '📧 Add Found Email' : 
                       enrichmentType === 'phone' ? '📞 Add Found Phone' : 
                       '📧📞 Add Found Results'}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-white/50 rounded-xl">
                    <h4 className="font-semibold text-warning-900 mb-2">📋 Quick Instructions:</h4>
                    <ol className="text-sm text-warning-700 text-left space-y-1">
                      <li>1. Click "Open Data Provider Dashboard"</li>
                      <li>2. Find your request using ID: <strong>{requestId}</strong></li>
                      <li>3. Copy the email address from the results</li>
                      <li>4. Click "Add Found Email" and paste it</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lookup History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Lookup History</h3>
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading lookup history...</p>
            </div>
          ) : lookupHistory.length > 0 ? (
            <div className="space-y-3">
              {lookupHistory.map((request) => {
                const inputData = request.input_data?.data?.[0];
                const contactName = inputData ? 
                  `${inputData.first_name || 'Unknown'} ${inputData.last_name || ''} - ${inputData.company || 'Unknown Company'}` : 
                  'Individual Lookup';
                
                return (
                  <div key={request.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mr-4">
                      <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                        <History className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {contactName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {request.enrichment_type} enrichment • {request.status === 'completed' ? 'Done' : request.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(request.created_at).toLocaleDateString()} • Request ID: {request.request_id}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center ${
                        request.status === 'completed' 
                          ? 'text-green-600' 
                          : request.status === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {request.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : request.status === 'failed' ? (
                          <XCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <Clock className="w-4 h-4 mr-1" />
                        )}
                        <span className="text-xs font-medium capitalize">
                          {request.status === 'completed' ? 'Done' : request.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewDetails(request.request_id)}
                        className="btn-secondary text-sm py-2 px-3 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No lookup history</p>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {results.length > 0 && (
            <ResultTable results={results} />
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
                <ResultTable results={modalResults} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No results found for this request</p>
                  <p className="text-sm text-gray-400 mb-4">The enrichment may still be processing or results haven't been saved yet.</p>
                  <button
                    onClick={async () => {
                      setModalLoading(true);
                      try {
                        // Try to fetch from BetterContact API directly
                        const response = await fetch(`/api/enrich/results?requestId=${requestId}`);
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