import { NextRequest, NextResponse } from 'next/server';
import { startUserTrial, isTrialEligible } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Trial start API called');

    const body = await request.json();
    const { userId } = body;

    // Validate user authentication
    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ User ID received:', userId);

    // Check trial eligibility
    const eligibilityCheck = await isTrialEligible(userId);

    if (!eligibilityCheck.eligible) {
      console.log('❌ User not eligible for trial:', eligibilityCheck.reason);
      return NextResponse.json(
        {
          error: eligibilityCheck.reason,
        },
        { status: 400 }
      );
    }

    console.log('✅ User eligible for trial');

    // Start the trial
    const result = await startUserTrial(userId);

    if (result.error) {
      console.error('❌ Failed to start trial:', result.error);
      return NextResponse.json(
        {
          error: 'Failed to start trial',
        },
        { status: 500 }
      );
    }

    console.log('✅ Trial started successfully');

    return NextResponse.json({
      success: true,
      data: {
        trialEndsAt: result.data?.trialEndsAt,
        credits: 50,
        message: 'Trial started successfully',
      },
    });
  } catch (error) {
    console.error('❌ Exception in trial start API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
