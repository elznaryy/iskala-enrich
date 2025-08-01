export interface EnrichmentData {
  first_name?: string;
  last_name?: string;
  company?: string;
  company_domain?: string;
  linkedin_url?: string;
  custom_fields?: {
    uuid: string;
    list_name: string;
  };
}

export interface EnrichmentRequest {
  data: EnrichmentData[];
  enrich_email_address: boolean;
  enrich_phone_number: boolean;
}

export interface EnrichmentResponse {
  success: boolean;
  id: string;
  message: string;
}

export interface EnrichmentResult {
  id: string;
  status: 'pending' | 'processing' | 'terminated' | 'failed';
  credits_consumed?: number;
  credits_left?: number;
  summary?: {
    total: number;
    valid: number;
    catch_all: number;
    catch_all_safe: number;
    catch_all_not_safe: number;
    undeliverable: number;
    not_found: number;
  };
  data?: any[];
  error?: string;
}

export async function startEnrichment({
  data,
  enrich_email,
  enrich_phone,
  apiKey
}: {
  data: EnrichmentData[];
  enrich_email: boolean;
  enrich_phone: boolean;
  apiKey?: string;
}): Promise<EnrichmentResponse> {
  const API_KEY = apiKey || process.env.BETTERCONTACT_API_KEY;
  
  if (!API_KEY) {
    throw new Error('BetterContact API key is not configured. Please add BETTERCONTACT_API_KEY to your .env.local file');
  }

  console.log('🔑 Making API call with key:', API_KEY.substring(0, 10) + '...');
  
  const response = await fetch('https://app.bettercontact.rocks/api/v2/async', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      'X-BetterContact-API-Key': API_KEY
    },
    body: JSON.stringify({
      data,
      enrich_email_address: enrich_email,
      enrich_phone_number: enrich_phone,
    })
  });

  console.log('📡 API Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error response:', errorText);
    throw new Error(`BetterContact API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('✅ API Response data:', responseData);
  
  return responseData;
}

export async function pollEnrichmentResult(requestId: string, apiKey?: string): Promise<EnrichmentResult> {
  console.log('🔍 Polling results for request ID:', requestId);

  // Try multiple approaches based on API documentation
  const API_KEY = apiKey || process.env.BETTERCONTACT_API_KEY;
  
  const approaches: Array<{
    name: string;
    options: RequestInit;
    useQueryParam?: boolean;
  }> = [
    // 1. Exactly as shown in documentation (no headers)
    {
      name: 'No Auth (as docs)',
      options: { method: 'GET' }
    },
    // 2. With API key in different header formats
    {
      name: 'Bearer Token',
      options: {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      }
    },
    // 3. With X-API-Key header
    {
      name: 'X-API-Key',
      options: {
        method: 'GET',
        headers: { 'X-API-Key': API_KEY || '' }
      }
    },
    // 4. API key as query parameter
    {
      name: 'Query Parameter',
      options: { method: 'GET' },
      useQueryParam: true
    }
  ];

  for (const approach of approaches) {
    try {
      console.log(`🧪 Trying approach: ${approach.name}`);
      
      let url = `https://app.bettercontact.rocks/api/v2/async/${requestId}`;
      
      // Add API key as query parameter if needed
      if (approach.useQueryParam && API_KEY) {
        url += `?api_key=${API_KEY}`;
      }
      
      const response = await fetch(url, approach.options);
      
      console.log(`📡 ${approach.name} Response status:`, response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ SUCCESS! Polling Response data:', responseData);
        return responseData;
      } else {
        const errorText = await response.text();
        console.log(`❌ ${approach.name} Error:`, errorText);
      }
    } catch (error) {
      console.log(`💥 ${approach.name} Exception:`, error);
    }
  }

  // If all approaches failed, throw error
  throw new Error('All polling approaches failed. The GET endpoint may not be accessible with current API key.');
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 