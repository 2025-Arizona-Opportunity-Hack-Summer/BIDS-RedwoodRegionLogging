import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Application confirmation email template
export function generateApplicationConfirmationEmail(applicantName: string, scholarshipName: string, applicationId: string): EmailTemplate {
  const subject = `Application Confirmed: ${scholarshipName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Application Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: rgb(61,84,44); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        .highlight { background-color: rgb(255,211,88); padding: 2px 6px; border-radius: 4px; }
        .button { display: inline-block; background-color: rgb(9,76,9); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Application Received</h1>
        <p>Redwood Region Logging Conference</p>
      </div>
      <div class="content">
        <h2>Dear ${applicantName},</h2>
        <p>Thank you for your scholarship application! We have successfully received your application for:</p>
        <p><strong class="highlight">${scholarshipName}</strong></p>
        
        <p><strong>Application ID:</strong> ${applicationId}</p>
        
        <h3>What happens next?</h3>
        <ul>
          <li>Our review committee will carefully evaluate your application</li>
          <li>We will notify you of any status updates via email</li>
          <li>Final award decisions will be communicated within 2-4 weeks</li>
        </ul>
        
        <p>If you have any questions about your application, please contact us and reference your application ID.</p>
        
        <p>Best regards,<br>
        The RRLC Scholarship Committee</p>
      </div>
      <div class="footer">
        <p>Redwood Region Logging Conference<br>
        Supporting the next generation of forestry professionals</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Application Confirmation - Redwood Region Logging Conference
    
    Dear ${applicantName},
    
    Thank you for your scholarship application! We have successfully received your application for: ${scholarshipName}
    
    Application ID: ${applicationId}
    
    What happens next?
    - Our review committee will carefully evaluate your application
    - We will notify you of any status updates via email
    - Final award decisions will be communicated within 2-4 weeks
    
    If you have any questions about your application, please contact us and reference your application ID.
    
    Best regards,
    The RRLC Scholarship Committee
    
    Redwood Region Logging Conference
    Supporting the next generation of forestry professionals
  `;
  
  return { subject, html, text };
}

// Status change notification email template
export function generateStatusChangeEmail(applicantName: string, scholarshipName: string, newStatus: string, applicationId: string): EmailTemplate {
  const statusMessages = {
    under_review: {
      subject: 'Application Under Review',
      message: 'Your scholarship application is now under review by our committee.',
      color: 'rgb(197,155,60)'
    },
    approved: {
      subject: 'Application Approved - Congratulations!',
      message: 'Congratulations! Your scholarship application has been approved.',
      color: 'rgb(9,76,9)'
    },
    rejected: {
      subject: 'Application Decision',
      message: 'After careful consideration, we are unable to award this scholarship at this time.',
      color: 'rgb(147,51,56)'
    },
    awarded: {
      subject: 'Scholarship Awarded - Congratulations!',
      message: 'Congratulations! You have been awarded this scholarship.',
      color: 'rgb(9,76,9)'
    }
  };
  
  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || {
    subject: 'Application Status Update',
    message: `Your application status has been updated to: ${newStatus}`,
    color: 'rgb(78,61,30)'
  };
  
  const subject = `${statusInfo.subject}: ${scholarshipName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Application Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: rgb(61,84,44); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        .status-badge { background-color: ${statusInfo.color}; color: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 15px 0; }
        .highlight { background-color: rgb(255,211,88); padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Application Status Update</h1>
        <p>Redwood Region Logging Conference</p>
      </div>
      <div class="content">
        <h2>Dear ${applicantName},</h2>
        <p>We have an update regarding your scholarship application for:</p>
        <p><strong class="highlight">${scholarshipName}</strong></p>
        
        <div class="status-badge">
          Status: ${newStatus.replace('_', ' ').toUpperCase()}
        </div>
        
        <p>${statusInfo.message}</p>
        
        <p><strong>Application ID:</strong> ${applicationId}</p>
        
        ${newStatus === 'awarded' ? '<p>Please watch for additional communications regarding next steps and award details.</p>' : ''}
        ${newStatus === 'approved' ? '<p>Final award amounts and details will be communicated separately.</p>' : ''}
        
        <p>If you have any questions, please contact us and reference your application ID.</p>
        
        <p>Best regards,<br>
        The RRLC Scholarship Committee</p>
      </div>
      <div class="footer">
        <p>Redwood Region Logging Conference<br>
        Supporting the next generation of forestry professionals</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Application Status Update - Redwood Region Logging Conference
    
    Dear ${applicantName},
    
    We have an update regarding your scholarship application for: ${scholarshipName}
    
    Status: ${newStatus.replace('_', ' ').toUpperCase()}
    
    ${statusInfo.message}
    
    Application ID: ${applicationId}
    
    ${newStatus === 'awarded' ? 'Please watch for additional communications regarding next steps and award details.' : ''}
    ${newStatus === 'approved' ? 'Final award amounts and details will be communicated separately.' : ''}
    
    If you have any questions, please contact us and reference your application ID.
    
    Best regards,
    The RRLC Scholarship Committee
    
    Redwood Region Logging Conference
    Supporting the next generation of forestry professionals
  `;
  
  return { subject, html, text };
}

// Award notification email template
export function generateAwardNotificationEmail(applicantName: string, scholarshipName: string, awardAmount: number, applicationId: string): EmailTemplate {
  const subject = `Scholarship Award: ${scholarshipName} - $${awardAmount.toLocaleString()}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Scholarship Award</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: rgb(9,76,9); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        .award-amount { background-color: rgb(255,211,88); color: rgb(78,61,30); padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .highlight { background-color: rgb(255,211,88); padding: 2px 6px; border-radius: 4px; }
        .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="celebration">🎉</div>
        <h1>Congratulations!</h1>
        <p>Scholarship Award Notification</p>
      </div>
      <div class="content">
        <h2>Dear ${applicantName},</h2>
        <p>We are thrilled to inform you that you have been selected as a recipient of the:</p>
        <p><strong class="highlight">${scholarshipName}</strong></p>
        
        <div class="award-amount">
          Award Amount: $${awardAmount.toLocaleString()}
        </div>
        
        <p><strong>Application ID:</strong> ${applicationId}</p>
        
        <h3>Next Steps:</h3>
        <ul>
          <li>Watch for additional communications with award details and requirements</li>
          <li>Complete any required paperwork promptly when received</li>
          <li>Maintain your academic standing and program enrollment</li>
          <li>Consider attending our annual conference to network with industry professionals</li>
        </ul>
        
        <p><strong>Important:</strong> Please save this email for your records and reference your application ID in any future communications.</p>
        
        <p>We believe in your potential to make a significant impact in the forestry industry, and we're proud to support your educational journey.</p>
        
        <p>Congratulations once again!</p>
        
        <p>Best regards,<br>
        The RRLC Scholarship Committee</p>
      </div>
      <div class="footer">
        <p>Redwood Region Logging Conference<br>
        Supporting the next generation of forestry professionals</p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    🎉 CONGRATULATIONS! 🎉
    Scholarship Award Notification - Redwood Region Logging Conference
    
    Dear ${applicantName},
    
    We are thrilled to inform you that you have been selected as a recipient of the: ${scholarshipName}
    
    Award Amount: $${awardAmount.toLocaleString()}
    
    Application ID: ${applicationId}
    
    Next Steps:
    - Watch for additional communications with award details and requirements
    - Complete any required paperwork promptly when received
    - Maintain your academic standing and program enrollment
    - Consider attending our annual conference to network with industry professionals
    
    Important: Please save this email for your records and reference your application ID in any future communications.
    
    We believe in your potential to make a significant impact in the forestry industry, and we're proud to support your educational journey.
    
    Congratulations once again!
    
    Best regards,
    The RRLC Scholarship Committee
    
    Redwood Region Logging Conference
    Supporting the next generation of forestry professionals
  `;
  
  return { subject, html, text };
}

// Send email function
export async function sendEmail({ to, subject, html, text }: SendEmailData): Promise<{ success: boolean; error: string | null; messageId?: string }> {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
      console.log('Email simulation - Resend API key not configured');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text || 'No text version'}`);
      return { 
        success: true, 
        error: null, 
        messageId: `simulated-${Date.now()}` 
      };
    }

    const { data, error } = await resend.emails.send({
      from: 'RRLC Scholarships <scholarships@rrlc.org>',
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    return { success: true, error: null, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}

// Convenience functions for different email types
export async function sendApplicationConfirmation(to: string, applicantName: string, scholarshipName: string, applicationId: string) {
  const emailTemplate = generateApplicationConfirmationEmail(applicantName, scholarshipName, applicationId);
  return sendEmail({
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text
  });
}

export async function sendStatusChangeNotification(to: string, applicantName: string, scholarshipName: string, newStatus: string, applicationId: string) {
  const emailTemplate = generateStatusChangeEmail(applicantName, scholarshipName, newStatus, applicationId);
  return sendEmail({
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text
  });
}

export async function sendAwardNotification(to: string, applicantName: string, scholarshipName: string, awardAmount: number, applicationId: string) {
  const emailTemplate = generateAwardNotificationEmail(applicantName, scholarshipName, awardAmount, applicationId);
  return sendEmail({
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text
  });
}