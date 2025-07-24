import { NextRequest, NextResponse } from 'next/server';
import { sendStatusChangeNotification } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const { to, applicantName, scholarshipName, newStatus, applicationId } = await request.json();

    // Validate required fields
    if (!to || !applicantName || !scholarshipName || !newStatus || !applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, applicantName, scholarshipName, newStatus, applicationId' },
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

    // Validate status
    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'awarded'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await sendStatusChangeNotification(to, applicantName, scholarshipName, newStatus, applicationId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Status change notification email sent',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-status-change:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}