import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received alert data:", body);

    const explanation = `Peringatan banjir untuk wilayah ${
      body.alertData?.lokasi || "tidak diketahui"
    }: ${body.alertData?.status || "tidak diketahui"}`;

    return NextResponse.json({ explanation }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Gemini Alerts API is running" },
    { status: 200 }
  );
}
