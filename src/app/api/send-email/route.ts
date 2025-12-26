import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration - ALL emails go ONLY to leojoemail@gmail.com
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'leojoemail@gmail.com',
    pass: 'tuxy beqj rqgd fmax',
  },
};

const RECIPIENT_EMAIL = 'leojoemail@gmail.com';

// Email subjects based on form type
const EMAIL_SUBJECTS: Record<string, string> = {
  registration: 'capratecompany.com new registration',
  contact: 'capratecompany.com new contact request',
  property_inquiry: 'capratecompany.com new property related inquiry',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      formType, 
      name, 
      email, 
      phone, 
      subject, 
      message, 
      propertyAddress, 
      propertyId,
      password // For registration
    } = body;

    // Validate required fields
    if (!formType || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the correct subject based on form type
    const emailSubject = EMAIL_SUBJECTS[formType] || 'capratecompany.com new inquiry';

    // Create email content based on form type
    let emailContent = '';
    
    if (formType === 'registration') {
      emailContent = `
        <h2>New User Registration</h2>
        <hr/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">This registration was submitted from capratecompany.com</p>
      `;
    } else if (formType === 'contact') {
      emailContent = `
        <h2>New Contact Request</h2>
        <hr/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <hr/>
        <h3>Message:</h3>
        <p>${message || 'No message provided'}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">This message was submitted from capratecompany.com contact page</p>
      `;
    } else if (formType === 'property_inquiry') {
      emailContent = `
        <h2>New Property Inquiry</h2>
        <hr/>
        <h3>Property Details:</h3>
        <p><strong>Property Address:</strong> ${propertyAddress || 'Not specified'}</p>
        <p><strong>Property ID:</strong> ${propertyId || 'Not specified'}</p>
        <hr/>
        <h3>Contact Information:</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'Property Inquiry'}</p>
        <hr/>
        <h3>Message:</h3>
        <p>${message || 'No message provided'}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">This inquiry was submitted from capratecompany.com property detail page</p>
      `;
    }

    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    // Send email ONLY to leojoemail@gmail.com
    await transporter.sendMail({
      from: `"Cap Rate" <${SMTP_CONFIG.auth.user}>`,
      to: RECIPIENT_EMAIL,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h2 { color: #1a1a1a; border-bottom: 2px solid #f5c518; padding-bottom: 10px; }
            h3 { color: #555; margin-top: 20px; }
            p { margin: 8px 0; }
            strong { color: #1a1a1a; }
            hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
          </style>
        </head>
        <body>
          ${emailContent}
        </body>
        </html>
      `,
      replyTo: email, // User's email for easy reply
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}


