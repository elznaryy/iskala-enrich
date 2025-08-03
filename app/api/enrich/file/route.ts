import { NextRequest, NextResponse } from 'next/server';
import { startEnrichment, generateUUID } from '@/utils/betterContactApi';
import { createServerSupabaseClient } from '@/lib/supabase';
import { checkUserCredits } from '@/lib/database';
import { getCreditsForEnrichment } from '@/lib/subscriptionPlans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, enrich_email, enrich_phone, fileName, sheetName, userId } = body;

    // Validate user authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected non-empty array.' },
        { status: 400 }
      );
    }

    // Check user credits before starting enrichment
    const enrichmentType = enrich_email && enrich_phone ? 'BOTH' : enrich_email ? 'EMAIL_ONLY' : 'PHONE_ONLY';
    const maxCreditsPerRecord = getCreditsForEnrichment(enrichmentType);
    const maxTotalCredits = maxCreditsPerRecord * data.length;
    
    console.log(`📊 Credit calculation: ${data.length} records × max ${maxCreditsPerRecord} credits per record = max ${maxTotalCredits} total credits needed`);
    
    const creditCheck = await checkUserCredits(userId, maxTotalCredits);
    
    if (!creditCheck.hasEnoughCredits) {
      console.log(`❌ Insufficient credits for user ${userId}: ${creditCheck.remainingCredits} remaining, ${maxTotalCredits} required`);
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          details: {
            remainingCredits: creditCheck.remainingCredits,
            requiredCredits: maxTotalCredits,
            message: `You need ${maxTotalCredits} credits (${data.length} records × max ${maxCreditsPerRecord} credits each) but only have ${creditCheck.remainingCredits} remaining.`
          }
        },
        { status: 402 } // Payment Required
      );
    }

    console.log(`✅ Credit check passed for user ${userId}: ${creditCheck.remainingCredits} remaining, ${maxTotalCredits} required`);

    // Add custom fields to each record
    const enrichedData = data.map(record => {
      // For phone enrichment, only send LinkedIn URL to API
      if (enrichmentType === 'PHONE_ONLY') {
        return {
          linkedin_url: record.linkedin_url,
          // Keep other fields for display purposes but don't send to API
          first_name: record.first_name,
          last_name: record.last_name,
          company: record.company,
          company_domain: record.company_domain,
          custom_fields: {
            uuid: generateUUID(),
            list_name: `file-enrichment-${fileName}${sheetName ? `-${sheetName}` : ''}`
          }
        };
      }
      
      // For email and both enrichment, send all fields
      return {
        ...record,
        custom_fields: {
          uuid: generateUUID(),
          list_name: `file-enrichment-${fileName}${sheetName ? `-${sheetName}` : ''}`
        }
      };
    });

    // Call BetterContact API
    const result = await startEnrichment({
      data: enrichedData,
      enrich_email,
      enrich_phone,
      apiKey: process.env.BETTERCONTACT_API_KEY
    });

    console.log('✅ BetterContact API response:', result);

    if (result.success) {
      // Save to database using server-side client
      const supabase = createServerSupabaseClient();
      const dbEnrichmentType = enrich_email && enrich_phone ? 'both' : enrich_email ? 'email' : 'phone';
      
      const { error: dbError } = await supabase
        .from('enrichment_requests')
        .insert({
          user_id: userId,
          request_id: result.id,
          request_type: 'file',
          enrichment_type: dbEnrichmentType,
          input_data: { 
            data: enrichedData, 
            enrich_email, 
            enrich_phone, 
            fileName, 
            sheetName,
            recordCount: data.length 
          },
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Failed to save request to database' },
          { status: 500 }
        );
      }
    }

    // Convert BetterContact response format to our expected format
    return NextResponse.json({
      request_id: result.id,
      status: result.success ? 'started' : 'failed',
      message: result.message,
      fileName,
      sheetName,
      recordCount: data.length
    });
  } catch (error) {
    console.error('File enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to start enrichment process' },
      { status: 500 }
    );
  }
} 