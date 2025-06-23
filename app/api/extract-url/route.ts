import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (we'll use it for its fetch capabilities)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      // Fetch the content from the URL using Supabase's fetch
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`)
      }

      // Get the text content
      const html = await response.text()

      // Extract text content
      const content = await extractContent(html)

      // If no content was extracted, return an error
      if (!content.trim()) {
        throw new Error("No content could be extracted from the URL")
      }

      return NextResponse.json({ content })
    } catch (error) {
      console.error("Error fetching URL:", error)
      return NextResponse.json(
        { error: `Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 422 }
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

async function extractContent(html: string): Promise<string> {
  try {
    // Use regex to extract text content, focusing on common article content areas
    let content = ''

    // Try to extract content from article tags
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch) {
      content = articleMatch[1]
    }

    // If no article tag, try main tag
    if (!content) {
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      if (mainMatch) {
        content = mainMatch[1]
      }
    }

    // If still no content, try common content class names
    if (!content) {
      const contentClasses = [
        'content',
        'post-content',
        'entry-content',
        'article-content',
        'blog-content'
      ]

      for (const className of contentClasses) {
        const classMatch = html.match(new RegExp(`<div[^>]*class="[^"]*${className}[^"]*"[^>]*>([\s\S]*?)<\/div>`, 'i'))
        if (classMatch) {
          content = classMatch[1]
          break
        }
      }
    }

    // If still no content, extract from body
    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        content = bodyMatch[1]
      }
    }

    // Clean up the extracted content
    if (content) {
      // Remove scripts
      content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove styles
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML tags
      content = content.replace(/<[^>]+>/g, '\n')
      // Remove extra whitespace
      content = content.replace(/\s+/g, ' ')
      // Remove extra newlines
      content = content.replace(/\n+/g, '\n')
      // Trim
      content = content.trim()
    }

    return content || ''
  } catch (error) {
    console.error('Error extracting content:', error)
    return ''
  }
}
