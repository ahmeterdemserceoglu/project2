import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: auth, error: userErr } = await supabase.auth.getUser();
    if (userErr || !auth?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch (e) {
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: auth, error: userErr } = await supabase.auth.getUser();
    if (userErr || !auth?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const status = typeof body?.status === 'string' ? body.status : undefined;
    if (!status) {
      return NextResponse.json({ error: "Geçersiz güncelleme" }, { status: 400 });
    }

    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
