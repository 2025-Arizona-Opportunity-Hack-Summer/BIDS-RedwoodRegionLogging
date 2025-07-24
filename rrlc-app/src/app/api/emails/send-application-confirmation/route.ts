import { NextRequest, NextResponse } from 'next/server';
import { sendApplicationConfirmation } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const { to, applicantName, scholarshipName, applicationId } = await request.json();

    // Validate required fields
    if (!to || !applicantName || !scholarshipName || !applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, applicantName, scholarshipName, applicationId' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const result = await sendApplicationConfirmation(to, applicantName, scholarshipName, applicationId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Application confirmation email sent',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-application-confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}