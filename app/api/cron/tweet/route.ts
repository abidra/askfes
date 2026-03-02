import { NextResponse } from "next/server";
import { generateViralQuestion } from "@/lib/gemini";
import { postToIFTTT } from "@/lib/ifttt";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tweet = await generateViralQuestion();
    const iftttResult = await postToIFTTT(tweet);

    if (!iftttResult.ok) {
      return NextResponse.json(
        {
          error: "IFTTT webhook failed",
          status: iftttResult.status,
          body: iftttResult.body,
          tweet,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      tweet,
      ifttt: { status: iftttResult.status },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
