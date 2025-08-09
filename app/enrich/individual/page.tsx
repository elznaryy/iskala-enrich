'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import InputField from '@/components/InputField';
import ResultTable from '@/components/ResultTable';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

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
    const maxAttempts = 12; // 2 minutes total (12 * 10 seconds) - reduced for faster manual fallback
    
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
          } else {
            toast.error('No results found');
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          toast.error('❌ Enrichment failed');
        } else if (attempts >= maxAttempts) {
          // Max attempts reached - switch to manual mode
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          
          toast.error('⏰ Automatic polling timed out. Use manual entry below.', {
            duration: 4000
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPollingInterval(null);
          setIsLoading(false);
          toast.error('❌ Failed to retrieve results. Use manual entry below.');
        }
      }
    }, 10000); // Poll every 10 seconds

    setPollingInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to use this feature');
      return;
    }
    
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
      console.log('📡 Individual enrichment API response:', data);

      if (response.ok && data.request_id) {
        console.log('✅ Received request ID:', data.request_id);
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
      } else if (response.ok && (!data.request_id || data.request_id === 'null')) {
        // Handle case where no request ID was returned
        setIsLoading(false);
        toast.error('❌ Failed to get request ID from API');
        console.error('No request ID in response:', data);
      } else {
        console.error('❌ API response error:', data);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold gradient-text mb-4">Individual Lookup</h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Manually input contact data to retrieve phone numbers, email addresses, or both.
            </p>
          </div>
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
              <>
                <InputField
                  label="LinkedIn URL"
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={(value) => handleFormChange('linkedin_url', value)}
                  placeholder="https://linkedin.com/in/username"
                  type="url"
                  required={true}
                />
                
                {enrichmentType === 'phone' && (
                  <>
                    <div className="text-sm text-gray-600 mb-2">
                      Optional fields for your reference (not sent to API):
                    </div>
                    <InputField
                      label="First Name (optional)"
                      name="first_name"
                      value={form.first_name}
                      onChange={(value) => handleFormChange('first_name', value)}
                      placeholder="Enter first name"
                      required={false}
                    />
                    <InputField
                      label="Last Name (optional)"
                      name="last_name"
                      value={form.last_name}
                      onChange={(value) => handleFormChange('last_name', value)}
                      placeholder="Enter last name"
                      required={false}
                    />
                    <InputField
                      label="Company Name (optional)"
                      name="company"
                      value={form.company}
                      onChange={(value) => handleFormChange('company', value)}
                      placeholder="Enter company name"
                      required={false}
                    />
                  </>
                )}
              </>
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
                  You can view your enrichment results in the BetterContact dashboard and add them here
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
                      🔗 Open BetterContact Dashboard
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
                          const email = prompt(`Found the email address in BetterContact? Paste it here:\n\nRequest ID: ${requestId}\nName: ${form.first_name} ${form.last_name}\nCompany: ${form.company}`);
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
                          const phone = prompt(`Found the phone number in BetterContact? Paste it here:\n\nRequest ID: ${requestId}\nName: ${form.first_name} ${form.last_name}\nLinkedIn: ${form.linkedin_url}`);
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
                          const email = prompt(`Found the email address in BetterContact? Paste it here:\n\nRequest ID: ${requestId}\nName: ${form.first_name} ${form.last_name}\nCompany: ${form.company}`);
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
                      <li>1. Click "Open BetterContact Dashboard"</li>
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

        {/* Results */}
        <div>
          {results.length > 0 && (
            <ResultTable results={results} enrichmentType={enrichmentType} />
          )}
        </div>
      </div>
    </div>
    </div>
  );
} 