import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Basit kimlik kontrolü (oturum yoksa erişim yok)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: "Kayıtlar alınırken hata oluştu" }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (e) {
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
  }
}
