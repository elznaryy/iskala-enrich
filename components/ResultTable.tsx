import React from 'react';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/utils/parseFile';

interface EnrichmentResult {
  first_name?: string;
  last_name?: string;
  company?: string;
  company_domain?: string;
  company_website?: string;
  linkedin_url?: string;
  email_address?: string;
  phone_number?: string;
  contact_email_address?: string;
  contact_phone_number?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  company_name?: string;
  status?: string;
  workflow?: string;
  source?: string;
  enriched?: boolean;
}

interface ResultTableProps {
  results: EnrichmentResult[];
  fileName?: string;
  sheetName?: string;
  enrichmentType?: 'email' | 'phone' | 'both';
}

export default function ResultTable({ results, fileName, sheetName, enrichmentType }: ResultTableProps) {
  console.log('📊 ResultTable received results:', results);
  if (results && results.length > 0) {
    console.log('📊 First result fields:', Object.keys(results[0]));
    console.log('📊 First result data:', results[0]);
    console.log('📊 Name fields check:', {
      first_name: results[0].first_name,
      last_name: results[0].last_name,
      contact_first_name: results[0].contact_first_name,
      contact_last_name: results[0].contact_last_name
    });
  }
  
  const handleExport = () => {
    const exportData = results.map(result => {
      const baseData = {
        'First Name': result.first_name || result.contact_first_name || '',
        'Last Name': result.last_name || result.contact_last_name || '',
        'Company': result.company || result.company_name || '',
        'Company Domain': result.company_domain || '',
        'Company Website': result.company_website || result.company_domain || '',
        'LinkedIn URL': result.linkedin_url || '',
        'Email Address': result.email_address || result.contact_email_address || 'Not found',
        'Status': result.status || '',
        'Workflow': result.workflow || ''
      };

      // Only include phone number if enrichment type includes phone
      if (enrichmentType === 'phone' || enrichmentType === 'both') {
        return {
          ...baseData,
          'Phone Number': result.phone_number || result.contact_phone_number || 'Not found'
        };
      }

      return baseData;
    });

    const exportFileName = `${fileName || 'enrichment'}-${sheetName || 'results'}.csv`;
    exportToCSV(exportData, exportFileName);
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results to display
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Enrichment Results
          {fileName && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({fileName}{sheetName && ` - ${sheetName}`})
            </span>
          )}
        </h3>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              {(enrichmentType === 'phone' || enrichmentType === 'both') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
              )}
              {results.some(r => r.workflow) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(result.first_name || result.contact_first_name) && (result.last_name || result.contact_last_name)
                    ? `${result.first_name || result.contact_first_name} ${result.last_name || result.contact_last_name}`
                    : (result.first_name || result.contact_first_name) || (result.last_name || result.contact_last_name) || 'N/A'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.company || result.company_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.company_website || result.company_domain ? (
                    <a 
                      href={`https://${result.company_website || result.company_domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {result.company_website || result.company_domain}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {result.email_address || result.contact_email_address ? (
                    <span className="text-green-600 font-medium">
                      {result.email_address || result.contact_email_address}
                    </span>
                  ) : (
                    <span className="text-red-500">Not found</span>
                  )}
                </td>
                {(enrichmentType === 'phone' || enrichmentType === 'both') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.phone_number || result.contact_phone_number ? (
                      <span className="text-green-600 font-medium">
                        {result.phone_number || result.contact_phone_number}
                      </span>
                    ) : (
                      <span className="text-red-500">Not found</span>
                    )}
                  </td>
                )}
                {results.some(r => r.workflow) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.workflow || ''}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 