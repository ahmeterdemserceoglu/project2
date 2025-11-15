import { NextRequest, NextResponse } from 'next/server';

// This endpoint receives Supabase's automatic email verification redirect
// and prevents the default confirmation flow by redirecting immediately to our verification page
export async function GET(request: NextRequest) {
  try {
    // Extract email from the query string
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      // If no email is provided, redirect to the home page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Redirect to our custom verification page
    // Note: We're ignoring any Supabase tokens and using our own system
    return NextResponse.redirect(
      new URL(`/register/confirm?email=${encodeURIComponent(email)}`, request.url)
    );
  } catch (error) {
    // Fallback to the home page in case of errors
    return NextResponse.redirect(new URL('/', request.url));
  }
} 