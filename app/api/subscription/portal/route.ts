import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalUrl } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json();
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    console.log('Creating portal URL for customer:', customerId);
    const portalUrl = await createCustomerPortalUrl(customerId, returnUrl || '/dashboard');
    
    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Failed to create customer portal URL:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal URL' },
      { status: 500 }
    );
  }
} 