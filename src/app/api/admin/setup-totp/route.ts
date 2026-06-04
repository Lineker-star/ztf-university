import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Dynamic import to avoid SSR issues
    const OTPAuth = await import('otpauth');
    const QRCode = await import('qrcode');

    // Generate a new TOTP secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const secretBase32 = secret.base32;

    // Build the TOTP URI
    const totp = new OTPAuth.TOTP({
      issuer: 'ZTF University Institute',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secretBase32,
    });

    const otpauthUrl = totp.toString();

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.default.toDataURL(otpauthUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#0A1628', light: '#FFFFFF' },
    });

    // Save the secret to admin_users (attempt — graceful if table doesn't exist)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase
        .from('admin_users')
        .update({ totp_secret: secretBase32, totp_enabled: false })
        .eq('email', email.toLowerCase().trim());
    } catch {
      // Table may not exist yet — still return secret so user can set up authenticator
    }

    // Format secret in groups of 4 for display
    const formattedSecret = secretBase32.match(/.{1,4}/g)?.join(' ') || secretBase32;

    return NextResponse.json({
      success: true,
      secret: secretBase32,
      formattedSecret,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate TOTP secret' }, { status: 500 });
  }
}
