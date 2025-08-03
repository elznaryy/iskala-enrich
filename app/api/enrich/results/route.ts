import { NextRequest, NextResponse } from 'next/server';
import { pollEnrichmentResult } from '@/utils/betterContactApi';
import { createServerSupabaseClient } from '@/lib/supabase';
import { updateEnrichmentRequest, saveBulkResults, incrementUserCredits } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Polling BetterContact API for request ID:', requestId);

    // Poll BetterContact API for results
    const result = await pollEnrichmentResult(requestId, process.env.BETTERCONTACT_API_KEY);

    console.log('📊 BetterContact API response:', result);

    // If we got results, save them to database and update status
    if (result.status === 'terminated' && result.data && result.data.length > 0) {
      console.log('✅ Terminated with results, saving to database...');
      try {
        const supabase = createServerSupabaseClient();
        
        // Get the enrichment request to find user_id
        const { data: request } = await supabase
          .from('enrichment_requests')
          .select('user_id, enrichment_type')
          .eq('request_id', requestId)
          .single();

        if (request) {
          // Save results to database
          const { error: saveError } = await saveBulkResults(result.data, requestId, request.user_id);
          
          if (!saveError) {
            console.log('✅ Results saved to database successfully');
            
            // Calculate credits used based on actual results
            let totalCreditsUsed = 0;
            let emailRecords = 0;
            let phoneRecords = 0;
            let bothRecords = 0;
            
            result.data.forEach(record => {
              const hasEmail = record.contact_email_address && 
                              record.contact_email_address !== 'Not found' && 
                              record.contact_email_address !== 'null' && 
                              record.contact_email_address.trim() !== '';
              const hasPhone = record.contact_phone_number && 
                              record.contact_phone_number !== 'Not found' && 
                              record.contact_phone_number !== 'null' && 
                              record.contact_phone_number.trim() !== '';
              
              if (hasEmail && hasPhone) {
                // Both email and phone found - 11 credits
                totalCreditsUsed += 11;
                bothRecords++;
              } else if (hasEmail) {
                // Only email found - 1 credit
                totalCreditsUsed += 1;
                emailRecords++;
              } else if (hasPhone) {
                // Only phone found - 10 credits
                totalCreditsUsed += 10;
                phoneRecords++;
              }
              // If neither found, no credits used
            });
            
            console.log(`📊 Credit calculation: ${emailRecords} email records (1 credit each) + ${phoneRecords} phone records (10 credits each) + ${bothRecords} both records (11 credits each) = ${totalCreditsUsed} total credits used`);
            
            // Update request status to completed
            await updateEnrichmentRequest(requestId, { 
              status: 'completed'
            });

            // Only deduct credits for successful records
            if (totalCreditsUsed > 0) {
              await incrementUserCredits(request.user_id, totalCreditsUsed);
              console.log(`✅ Deducted ${totalCreditsUsed} credits (${emailRecords} email + ${phoneRecords} phone + ${bothRecords} both records)`);
            } else {
              console.log('ℹ️ No successful records found, no credits deducted');
            }
          } else {
            console.error('❌ Error saving results to database:', saveError);
          }
        }
      } catch (dbError) {
        console.error('❌ Database update error:', dbError);
      }
    } else if (result.status === 'failed') {
      console.log('❌ Request failed, updating status...');
      // Update request status to failed
      await updateEnrichmentRequest(requestId, { 
        status: 'failed'
      });
    } else {
      console.log('⏳ Request still in progress:', result.status);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Results polling error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrichment results' },
      { status: 500 }
    );
  }
} 