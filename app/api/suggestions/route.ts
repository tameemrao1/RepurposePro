import { NextResponse } from "next/server"
import type { SuggestionRequest, Suggestion } from "@/lib/types"

// OpenRouter API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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"

export async function POST(request: Request) {
  try {
    const body: SuggestionRequest = await request.json()
    const { content, platform, tone, count = 3 } = body

    if (!content || !platform || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const suggestions = await generateSuggestions(content, platform, tone, count)
      return NextResponse.json({ results: suggestions })
    } catch (error) {
      console.error("Error generating suggestions:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    )
  }
}

async function generateSuggestions(blogContent: string, platform: string, tone: string, count: number): Promise<Suggestion[]> {
  const prompt = createPromptForSuggestions(blogContent, platform, tone, count)

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://repurpose-pro.vercel.app",
        "X-Title": "Repurpose Pro",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: [
          {
            role: "system",
            content: "You are an expert content marketer specializing in generating creative content suggestions. Your task is to provide unique content ideas that match the specified platform and tone requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    const suggestions: Suggestion[] = data.choices[0].message.content
      .split('\n')
      .filter(Boolean)
      .slice(0, count)
      .map((suggestion: string) => ({
        platform,
        content: suggestion.trim()
      }))

    return suggestions
  } catch (error) {
    console.error("Error in generateSuggestions:", error)
    throw error
  }
}

function createPromptForSuggestions(blogContent: string, platform: string, tone: string, count: number) {
  return `Generate ${count} unique content suggestions for ${platform} using a ${tone} tone based on this content. Each suggestion should be on a new line and be different from each other.\n\nOriginal content:\n${blogContent}`
}
