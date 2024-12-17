import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction.";
      console.log("iam here..");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 400,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    });

    console.log("iam here..");
    console.log(response);

    // Stream data correctly
    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        for await (const chunk of response) {
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const text = chunk.choices[0].delta.content;
            const encodedText = encoder.encode(text);
            controller.enqueue(encodedText);
          }
        }

        controller.close();
      },
    });

    console.log("iam here..2");

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      console.error("An unexpected error occurred", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
 