import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Save to database (non-fatal — email still sends even if DB write fails)
    await supabase.from('contact_messages').insert({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (!process.env.RESEND_API_KEY) {
      console.log('Resend not configured — message saved to DB only');
      return NextResponse.json({ success: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sentAt = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' });

    // Notification email to university
    await resend.emails.send({
      from: 'ZTF University Website <noreply@ztfuniversity.com>',
      to: ['info@ztfuniversity.com'],
      replyTo: email,
      subject: `New Contact Message: ${subject || 'General Inquiry'} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1628; padding: 25px; text-align: center;">
            <h2 style="color: #C9A84C; margin: 0;">ZTF University Institute</h2>
            <p style="color: white; margin: 5px 0; font-size: 12px;">New Message from Website Contact Form</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0A1628; width: 30%;">Name:</td>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; font-weight: bold; color: #0A1628;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0A1628;">Phone:</td>
                <td style="padding: 10px;">${phone || 'Not provided'}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; font-weight: bold; color: #0A1628;">Subject:</td>
                <td style="padding: 10px;">${subject || 'General Inquiry'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #0A1628; vertical-align: top;">Message:</td>
                <td style="padding: 10px; white-space: pre-wrap;">${message}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px; font-weight: bold; color: #0A1628;">Sent at:</td>
                <td style="padding: 10px;">${sentAt} (Cameroon time)</td>
              </tr>
            </table>
          </div>
          <div style="background: #0A1628; padding: 15px; text-align: center;">
            <p style="color: #888; font-size: 11px; margin: 0;">
              Reply directly to this email to respond to ${name}<br/>
              ZTF University Institute | Koumé, Bertoua, Cameroon
            </p>
          </div>
        </div>
      `,
    });

    // Auto-reply to sender
    await resend.emails.send({
      from: 'ZTF University Institute <info@ztfuniversity.com>',
      to: [email],
      subject: `Message Received — ZTF University Institute`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1628; padding: 25px; text-align: center;">
            <h2 style="color: #C9A84C; margin: 0;">ZTF University Institute</h2>
            <p style="color: white; margin: 5px 0; font-size: 12px;">Institut Universitaire ZTF | Bertoua, Cameroon</p>
          </div>
          <div style="padding: 30px;">
            <p>Dear ${name},</p>
            <p>Thank you for contacting ZTF University Institute. We have received your message and will respond within <strong>24–48 hours</strong>.</p>
            <div style="background: #f5f5f5; border-left: 4px solid #C9A84C; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Your message:</p>
              <p style="margin: 10px 0 0; color: #555; white-space: pre-wrap;">${message}</p>
            </div>
            <p>For urgent matters, please contact us directly:</p>
            <ul>
              <li>📞 (+237) 679 42 47 10</li>
              <li>📞 (+237) 691 45 96 11</li>
              <li>✉️ info@ztfuniversity.com</li>
            </ul>
            <p>God bless you,<br/><strong>ZTF University Institute Team</strong><br/>Koumé, Bertoua, East Region, Cameroon</p>
          </div>
          <div style="background: #0A1628; padding: 15px; text-align: center;">
            <p style="color: #888; font-size: 11px; margin: 0;">
              © 2026 ZTF University Institute. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
