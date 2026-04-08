import OpenAI from 'openai'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
          max_tokens: 1024,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          stream: true,
        })

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content
          if (text) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', text })}\n\n`
              )
            )
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        )
        controller.close()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
