import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types/supabase';

export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    try {
        const {
            user_id,
            email,
            first_name,
            last_name,
            phone,
            tax_id,
            company_name,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country
        } = await request.json();

        if (!user_id || !email) {
            return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
        }

        // Check 1: Does a profile already exist for this user_id?
        const { data: existingProfile, error: existingProfileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user_id)
            .maybeSingle();

        if (existingProfileError) {
             return NextResponse.json({ error: 'Server error while checking profile.' }, { status: 500 });
        }

        if (existingProfile) {
            return NextResponse.json(
                { error: 'Profile already exists for this user', id: existingProfile.id },
                { status: 409 }
            );
        }

        // Check 2: Does another profile exist with the same phone or tax_id?
        const orConditions = [];
        if (phone) orConditions.push(`phone.eq.${phone}`);
        if (tax_id) orConditions.push(`tax_id.eq.${tax_id}`);

        if (orConditions.length > 0) {
            const { data: duplicates, error: duplicateError } = (await supabase
                .from('profiles')
                .select('id')
                .or(orConditions.join(','))) as { data: { id: string }[] | null; error: any };

            if (duplicateError) {
                return NextResponse.json({ error: 'Server error while checking for duplicates.' }, { status: 500 });
            }

            if (duplicates && duplicates.length > 0) {
                return NextResponse.json(
                    { error: 'A profile with the same phone number or tax ID already exists.' },
                    { status: 409 }
                );
            }
        }

        // If all checks pass, create the new profile
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: user_id,
                email,
                first_name,
                last_name,
                phone,
                tax_id,
                company_name,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                country
            })
            .select()
            .single();

        if (createError) {
            if (createError.code === '23505') { // unique_violation
                 return NextResponse.json({ error: 'A profile with this information already exists.' }, { status: 409 });
            }
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        return NextResponse.json(newProfile);

    } catch (error: any) {
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
