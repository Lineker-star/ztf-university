import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('Resend not configured — skipping reply email');
      return NextResponse.json({ success: true, skipped: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'ztfuniversityinstitute@gmail.com',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0A1628; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 22px;">ZTF UNIVERSITY INSTITUTE</h1>
            <p style="color: #aaaaaa; margin: 5px 0 0; font-size: 13px;">Koume – Bertoua, East Region, Cameroon</p>
          </div>
          <div style="padding: 35px; background: #ffffff; border: 1px solid #eeeeee; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="color: #444; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">${message.replace(/\n/g, '<br/>')}</div>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              ZTF University Institute | Koume, Bertoua, East Region, Cameroon<br/>
              Tel: (+237) 679 42 47 10 | Email: ztfuniversityinstitute@gmail.com
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reply email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
