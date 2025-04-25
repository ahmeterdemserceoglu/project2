import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const logData = await request.json()

    // Burada logları veritabanına kaydedebilir veya başka bir servise gönderebilirsiniz
    console.log("[SERVER LOG]", logData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing log:", error)
    return NextResponse.json({ error: "Failed to process log" }, { status: 500 })
  }
}
