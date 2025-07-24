// Client-side email service for making API calls to email endpoints

export interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Send application confirmation email
export async function sendApplicationConfirmationEmail(
  to: string,
  applicantName: string,
  scholarshipName: string,
  applicationId: string
): Promise<EmailResponse> {
  try {
    const response = await fetch('/api/emails/send-application-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        applicantName,
        scholarshipName,
        applicationId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send confirmation email',
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Error sending application confirmation email:', error);
    return {
      success: false,
      error: 'Network error occurred while sending email',
    };
  }
}

// Send status change notification email
export async function sendStatusChangeNotificationEmail(
  to: string,
  applicantName: string,
  scholarshipName: string,
  newStatus: string,
  applicationId: string
): Promise<EmailResponse> {
  try {
    const response = await fetch('/api/emails/send-status-change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        applicantName,
        scholarshipName,
        newStatus,
        applicationId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send status change notification',
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Error sending status change notification:', error);
    return {
      success: false,
      error: 'Network error occurred while sending email',
    };
  }
}

// Send award notification email
export async function sendAwardNotificationEmail(
  to: string,
  applicantName: string,
  scholarshipName: string,
  awardAmount: number,
  applicationId: string
): Promise<EmailResponse> {
  try {
    const response = await fetch('/api/emails/send-award-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        applicantName,
        scholarshipName,
        awardAmount,
        applicationId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send award notification',
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Error sending award notification:', error);
    return {
      success: false,
      error: 'Network error occurred while sending email',
    };
  }
}

// Convenience function to send appropriate email based on status change
export async function sendEmailForStatusChange(
  to: string,
  applicantName: string,
  scholarshipName: string,
  newStatus: string,
  applicationId: string,
  awardAmount?: number
): Promise<EmailResponse> {
  // For awarded status with amount, send award notification
  if (newStatus === 'awarded' && awardAmount && awardAmount > 0) {
    return sendAwardNotificationEmail(to, applicantName, scholarshipName, awardAmount, applicationId);
  }
  
  // For all other status changes, send status change notification
  return sendStatusChangeNotificationEmail(to, applicantName, scholarshipName, newStatus, applicationId);
}