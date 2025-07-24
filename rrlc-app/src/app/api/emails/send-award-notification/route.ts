import { NextRequest, NextResponse } from 'next/server';
import { sendAwardNotification } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const { to, applicantName, scholarshipName, awardAmount, applicationId } = await request.json();

    // Validate required fields
    if (!to || !applicantName || !scholarshipName || !awardAmount || !applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, applicantName, scholarshipName, awardAmount, applicationId' },
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

    // Validate award amount
    if (typeof awardAmount !== 'number' || awardAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid award amount' },
        { status: 400 }
      );
    }

    const result = await sendAwardNotification(to, applicantName, scholarshipName, awardAmount, applicationId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Award notification email sent',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-award-notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}