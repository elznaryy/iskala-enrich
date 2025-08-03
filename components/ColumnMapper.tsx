import React from 'react';

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  enrichmentType: 'email' | 'phone' | 'both';
}

export default function ColumnMapper({ 
  headers, 
  mapping, 
  onMappingChange, 
  enrichmentType 
}: ColumnMapperProps) {
  const requiredFields = {
    email: ['first_name', 'last_name', 'company'],
    phone: ['linkedin_url'],
    both: ['first_name', 'last_name', 'company', 'linkedin_url']
  };

  const optionalFields = {
    email: ['company_domain'],
    phone: ['first_name', 'last_name', 'company'],
    both: ['company_domain']
  };

  const fieldLabels = {
    first_name: 'First Name',
    last_name: 'Last Name',
    company: 'Company Name',
    company_domain: 'Company Domain',
    linkedin_url: 'LinkedIn URL'
  };

  const handleMappingChange = (field: string, value: string) => {
    const newMapping = { ...mapping, [field]: value };
    onMappingChange(newMapping);
  };

  const getRequiredFields = () => {
    return requiredFields[enrichmentType] || [];
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Map Your Columns
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Select which columns from your file correspond to the required fields for {enrichmentType} enrichment.
      </p>

      <div className="space-y-4">
        {Object.entries(fieldLabels).map(([field, label]) => {
          const isRequired = getRequiredFields().includes(field);
          const isOptional = optionalFields[enrichmentType]?.includes(field);
          const shouldShow = getRequiredFields().includes(field) || isOptional;
          
          // Don't render if field shouldn't be shown for this enrichment type
          if (!shouldShow) return null;
          
          return (
            <div key={field} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
                {isOptional && <span className="text-blue-500 ml-1">(optional)</span>}
              </label>
              <select
                value={mapping[field] || ''}
                onChange={(e) => handleMappingChange(field, e.target.value)}
                className="input-field w-64"
                required={isRequired}
              >
                <option value="">Select a column...</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields for {enrichmentType} enrichment:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {getRequiredFields().map((field) => (
            <li key={field}>• {fieldLabels[field as keyof typeof fieldLabels]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 