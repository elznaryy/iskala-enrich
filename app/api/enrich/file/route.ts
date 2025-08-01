import { NextRequest, NextResponse } from 'next/server';
import { startEnrichment, generateUUID } from '@/utils/betterContactApi';
import { createServerSupabaseClient } from '@/lib/supabase';

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

    // Add custom fields to each record
    const enrichedData = data.map(record => ({
      ...record,
      custom_fields: {
        uuid: generateUUID(),
        list_name: `file-enrichment-${fileName}${sheetName ? `-${sheetName}` : ''}`
      }
    }));

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
      const enrichmentType = enrich_email && enrich_phone ? 'both' : enrich_email ? 'email' : 'phone';
      
      const { error: dbError } = await supabase
        .from('enrichment_requests')
        .insert({
          user_id: userId,
          request_id: result.id,
          request_type: 'file',
          enrichment_type: enrichmentType,
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