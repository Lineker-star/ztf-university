import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ exists: false, totp_enabled: false });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('admin_users')
      .select('email, totp_enabled, is_active')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // If admin_users table doesn't exist yet, allow any email in dev mode
      return NextResponse.json({ exists: true, totp_enabled: false, dev_mode: true });
    }

    return NextResponse.json({
      exists: true,
      totp_enabled: data.totp_enabled === true,
    });
  } catch {
    // DB not set up — allow login in dev mode
    return NextResponse.json({ exists: true, totp_enabled: false, dev_mode: true });
  }
}
