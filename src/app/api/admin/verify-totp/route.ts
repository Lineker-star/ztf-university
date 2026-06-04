import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, token, secret: inlineSecret } = await req.json();

    const OTPAuth = await import('otpauth');

    let totpSecret: string | null = inlineSecret || null;

    // Try to fetch from DB if no inline secret provided
    if (!totpSecret) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data } = await supabase
          .from('admin_users')
          .select('totp_secret, totp_enabled')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (data?.totp_secret) {
          totpSecret = data.totp_secret;

          // Mark as enabled on first successful verify
          if (!data.totp_enabled) {
            await supabase
              .from('admin_users')
              .update({ totp_enabled: true })
              .eq('email', email.toLowerCase().trim());
          }
        }
      } catch {
        // DB not available
      }
    }

    if (!totpSecret) {
      return NextResponse.json({ success: false, error: 'TOTP not configured' }, { status: 400 });
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'ZTF University Institute',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: totpSecret,
    });

    // window: 1 allows ±1 period (30s tolerance)
    const delta = totp.validate({ token: token.replace(/\s/g, ''), window: 1 });

    if (delta === null) {
      return NextResponse.json({ success: false, error: 'Invalid code. Please try again.' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('TOTP verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
