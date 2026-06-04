import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name, application_number } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.log('Resend not configured — skipping email');
      return NextResponse.json({ success: true, skipped: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'admissions@ztfuniversity.com',
      to: email,
      subject: `Application Received — ${application_number} | ZTF University Institute`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0A1628; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 22px;">ZTF UNIVERSITY INSTITUTE</h1>
            <p style="color: #aaaaaa; margin: 5px 0 0; font-size: 13px;">Koume – Bertoua, East Region, Cameroon</p>
          </div>
          <div style="padding: 35px; background: #ffffff; border: 1px solid #eeeeee; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0A1628; margin-top: 0;">Dear ${name},</h2>
            <p style="color: #555; line-height: 1.6;">
              Thank you for applying to <strong>ZTF University Institute</strong>. Your application has been successfully received and is now being processed by our admissions team.
            </p>
            <div style="background: #f9f9f9; border-left: 4px solid #C9A84C; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;"><strong>Your Application Number:</strong></p>
              <p style="margin: 8px 0 0; font-size: 28px; color: #C9A84C; font-weight: bold; font-family: Georgia, serif;">${application_number}</p>
            </div>
            <p style="color: #555; line-height: 1.6;"><strong>Please save this number.</strong> You will need it to check the status of your application.</p>
            <p style="color: #555; line-height: 1.6;">
              Our admissions team will review your application within <strong>7–14 business days</strong>.
              You will be notified by email of the admission decision.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ztfuniversity.com'}/admission"
                 style="background: #C9A84C; color: #0A1628; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                Check Application Status
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              ZTF University Institute | Koume, Bertoua, East Region, Cameroon<br/>
              Tel: (+237) 679 42 47 10 | Email: info@ztfuniversity.com<br/>
              <em>"Empowering World Innovators and Leaders for Global Impact"</em>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ success: true, emailError: true });
  }
}
