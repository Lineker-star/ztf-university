import { NextResponse } from 'next/server';

// Disabled — replaced by Google Authenticator (TOTP)
export async function POST() {
  return NextResponse.json({ disabled: true, message: 'Email OTP replaced by Google Authenticator (TOTP)' });
}
