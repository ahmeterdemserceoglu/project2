import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  phone: z.string().max(40).optional().nullable(),
  subject: z.string().min(2).max(120),
  message: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parse = ContactSchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 });
    }

    const supabase = await createClient();
    const payload = {
      name: parse.data.name,
      email: parse.data.email,
      phone: parse.data.phone || null,
      subject: parse.data.subject,
      message: parse.data.message,
      status: "new",
    } as const;

    const { error } = await supabase.from("contact_messages").insert(payload);
    if (error) {
      return NextResponse.json({ error: "Kayıt sırasında hata oluştu" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
