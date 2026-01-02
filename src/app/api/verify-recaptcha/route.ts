import { NextRequest, NextResponse } from 'next/server';

const RECAPTCHA_SECRET_KEY = '6Le5oTcsAAAAAMfjSfFG3MLvSPx-ItXYuoW8vufc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      );
    }

    // Verify the token with Google
    const verificationResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const verificationData = await verificationResponse.json();

    if (verificationData.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'reCAPTCHA verification successful' 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA verification failed',
          details: verificationData['error-codes'] 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'reCAPTCHA verification failed' },
      { status: 500 }
    );
  }
}








