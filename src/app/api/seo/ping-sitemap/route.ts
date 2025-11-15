import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const sitemapUrl = 'https://hdticaret.com/sitemap.xml';
    
    // Google'a sitemap'i bildir
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    // Bing'e sitemap'i bildir
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    const promises = [
      fetch(googlePingUrl),
      fetch(bingPingUrl)
    ];
    
    await Promise.allSettled(promises);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap ping sent to search engines',
      sitemap: sitemapUrl
    });
    
  } catch (error) {
    console.error('Error pinging sitemap:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to ping sitemap' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to ping sitemap to search engines' 
  });
}