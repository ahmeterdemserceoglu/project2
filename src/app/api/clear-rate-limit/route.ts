import { NextRequest, NextResponse } from 'next/server';
import { clearIPSuspiciousActivity } from '@/lib/advanced-rate-limiter';
import { clearFailedAttempts, getClientIP } from '@/lib/security';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        
        // Clear rate limit
        clearIPSuspiciousActivity(ip);
        
        // Clear failed attempts
        clearFailedAttempts(`${ip}_auth`);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Rate limit cleared for your IP',
            ip 
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to clear rate limit' 
        }, { status: 500 });
    }
}
