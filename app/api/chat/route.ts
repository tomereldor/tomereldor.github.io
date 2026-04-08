import OpenAI from 'openai'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Primary: Haiku (fast, cheap). Fallbacks: paid cheap → free tier.
const MODELS = [
  'anthropic/claude-haiku-4-5',
  'google/gemma-2-9b-it',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
]

export async function POST(req: Request) {
  const { messages } = await req.json()

  const encoder = new TextEncoder()
  const models = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL]
    : MODELS

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
          // Retry on provider errors (429 rate limit, 400/404 bad model); stop on auth/other
          const isProviderError = lastError.includes('429') || lastError.includes('400') || lastError.includes('404')
          if (!isProviderError) break
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
