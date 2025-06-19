import { type NextRequest, NextResponse } from "next/server"
import runChat from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    console.log("API Key exists:", !!process.env.GEMINI_API_KEY)
    console.log("Messages received:", messages)

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    // Generate response using Gemini
    const response = await runChat(lastMessage.content)

    // Return streaming response format expected by the frontend
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the response in chunks to simulate streaming
        const words = response.split(" ")
        let index = 0

        const sendChunk = () => {
          if (index < words.length) {
            const word = words[index] + (index < words.length - 1 ? " " : "")
            const data = `data: ${JSON.stringify({
              choices: [
                {
                  delta: { content: word },
                },
              ],
            })}\n\n`
            controller.enqueue(encoder.encode(data))
            index++
            setTimeout(sendChunk, 30) // Faster streaming for better UX
          } else {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          }
        }

        sendChunk()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
