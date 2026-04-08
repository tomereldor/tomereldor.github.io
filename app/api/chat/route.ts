import OpenAI from 'openai'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const FREE_MODELS = [
  'google/gemma-3-27b-it:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-3.3-70b-instruct:free',
]

export async function POST(req: Request) {
  const { messages } = await req.json()

  const encoder = new TextEncoder()
  const models = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL]
    : FREE_MODELS

  const stream = new ReadableStream({
    async start(controller) {
      let lastError = ''

      for (const model of models) {
        try {
          const response = await client.chat.completions.create({
            model,
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
          return
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error'
          // Only retry on rate limit (429); propagate other errors immediately
          if (!lastError.includes('429')) break
        }
      }

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'error', message: lastError })}\n\n`
        )
      )
      controller.close()
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
