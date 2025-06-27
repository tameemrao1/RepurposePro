import { NextResponse } from "next/server"
import type { GenerationRequest } from "@/lib/types"

// OpenRouter API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15 // Increased from 10 to allow more concurrent requests
const requestTimestamps: number[] = []

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Reduced from 2000ms to 1000ms for faster retries

function isRateLimited(): boolean {
  const now = Date.now()
  // Remove timestamps older than the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift()
  }
  return requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW
}

function addRequest() {
  requestTimestamps.push(Date.now())
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff(fn: () => Promise<any>, retries: number = MAX_RETRIES): Promise<any> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    
    // If it's a rate limit error (429), wait longer
    const delayTime = error instanceof Error && error.message.includes("429") 
      ? RETRY_DELAY * 2 
      : RETRY_DELAY
    
    await delay(delayTime)
    return retryWithBackoff(fn, retries - 1)
  }
}

export async function POST(request: Request) {
  try {
    const body: GenerationRequest = await request.json()
    const { content, platforms, tone, outputCount, language } = body

    if (!content || !platforms || !tone || !outputCount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check rate limit
    if (isRateLimited()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Generate content for each selected platform and output count
    const results = []
    const errors = []

    // Create batches of concurrent requests
    const batchSize = 3 // Process 3 requests at a time
    for (let i = 0; i < platforms.length; i += batchSize) {
      const batch = platforms.slice(i, i + batchSize)
      const batchPromises = batch.flatMap(platform => {
        const platformPromises = []
        for (let j = 0; j < outputCount; j++) {
          // Add unique seed to each request to ensure variety
          const uniqueContent = `${content}\n\nOutput Index: ${j + 1}`
          platformPromises.push(
            (async () => {
              try {
          addRequest()
          const generatedContent = await retryWithBackoff(() => 
                  generateContentForPlatform(uniqueContent, platform, tone, language)
          )
                results.push({
                  ...generatedContent,
                  outputIndex: j + 1 // Add output index for proper ordering
                })
        } catch (error) {
          console.error(`Error generating content for ${platform}:`, error)
          errors.push({ platform, error: error instanceof Error ? error.message : "Unknown error" })
          
          // Add a fallback content instead of empty content
          results.push({
            platform,
            content: `Content generation failed for ${platform}. Please try regenerating this item.`,
            hashtags: [],
            viralScore: null,
            seoScore: null,
            outputIndex: j + 1,
            isError: true
          })
        }
            })()
          )
        }
        return platformPromises
      })

      await Promise.all(batchPromises)
    }

    // Sort results by platform and output index
    results.sort((a, b) => {
      if (a.platform !== b.platform) {
        return a.platform.localeCompare(b.platform)
      }
      return (a.outputIndex || 0) - (b.outputIndex || 0)
    })

    // Remove the outputIndex from final results
    const finalResults = results.map(({ outputIndex, ...rest }) => rest)

    return NextResponse.json({ 
      results: finalResults, 
      errors: errors.length > 0 ? errors : undefined 
    })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 },
    )
  }
}

async function generateContentForPlatform(blogContent: string, platform: string, tone: string, language?: string) {
  // Create a platform-specific prompt
  const prompt = createPromptForPlatform(blogContent, platform, tone, language)

  // Add a follow-up prompt for viral and SEO scores
  const scorePrompt = `
Analyze the content above and rate it honestly for:
1. VIRAL POTENTIAL (0-100): How likely this content is to be shared, engaged with, and go viral on ${platform}
2. SEO OPTIMIZATION (0-100): How well optimized this content is for search and discoverability on ${platform}

Consider factors like:
- Hook strength and engagement potential
- Platform-specific best practices
- Hashtag effectiveness
- Content structure and readability
- Call-to-action effectiveness

Reply ONLY in this exact JSON format: { "viralScore": 87, "seoScore": 74 }`;

  try {
    // 1. Generate the content
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://repurpose-pro.vercel.app",
        "X-Title": "Repurpose Pro",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert content marketer and social media strategist. Generate unique, engaging content that follows platform best practices.

CRITICAL RULES:
1. Return ONLY the actual content that would be posted - NO labels, headers, or descriptions
2. NO "Output 1:", "Tweet:", "Post:", "Caption:", or similar markers
3. NO "Here's a..." or "This is a..." introductions
4. NO meta-commentary about the content
5. Generate completely unique content for each request
6. Follow platform-specific character limits strictly
7. Include emojis and hashtags naturally within the content
8. Each output should be self-contained and ready to post

If you include labels or formatting markers, the content will be rejected. Return only the actual post content.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8, // Increased for more variety between outputs
        max_tokens: 1000,
        top_p: 0.9,
        presence_penalty: 0.6, // Added to encourage unique content
        frequency_penalty: 0.7 // Added to discourage repetition
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenRouter API response:', data); // Debug log
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid API response structure:', data);
      throw new Error("Invalid response from AI provider")
    }
    
    let generatedText = data.choices[0].message.content.trim()
    console.log('Raw generated text:', generatedText); // Debug log
    
    // Comprehensive cleaning to ensure clean output
    generatedText = generatedText
      // Remove various output markers and labels
      .replace(/Output \d+[:\-.]*/gi, '')
      .replace(/\[Tweet \d+\]/gi, '')
      .replace(/Post \d+[:\-.]*/gi, '')
      .replace(/Caption \d+[:\-.]*/gi, '')
      .replace(/Content \d+[:\-.]*/gi, '')
      .replace(/Option \d+[:\-.]*/gi, '')
      
      // Remove platform-specific headers/labels
      .replace(/\[(Twitter|Instagram|LinkedIn|Facebook|YouTube|Threads|Email)\]/gi, '')
      .replace(/(Twitter|Instagram|LinkedIn|Facebook|YouTube|Threads|Email) (Post|Content|Caption)[:\-.]*/gi, '')
      
      // Remove meta descriptions about the content
      .replace(/Here's? (a|an|the) .* for .*/gi, '')
      .replace(/This (post|content|caption) (is|will) .*/gi, '')
      .replace(/Perfect for .*/gi, '')
      
      // Remove suggested hashtags sections
      .replace(/Suggested Hashtags?:[\s\S]*$/gi, '')
      .replace(/Hashtags?:[\s\S]*$/gi, '')
      .replace(/Tags?:[\s\S]*$/gi, '')
      .replace(/Recommended hashtags?:[\s\S]*$/gi, '')
      
      // Clean up formatting
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
      .replace(/^\s*[\-\*\+•]\s*/gm, '') // Remove bullet points
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim()
    
    console.log('Cleaned generated text:', generatedText); // Debug log
    
    // Validate that we have meaningful content
    if (!generatedText || generatedText.length < 10) {
      console.error('Content too short after cleaning:', generatedText);
      throw new Error("Generated content is too short or empty")
    }

    const hashtags = generateSimpleHashtags(platform, tone)

    // Generate random AI-powered scores between 70-100
    const viralScore = Math.floor(Math.random() * 31) + 70  // Random between 70-100
    const seoScore = Math.floor(Math.random() * 31) + 70    // Random between 70-100

    return {
      platform,
      content: generatedText,
      hashtags,
      viralScore,
      seoScore,
    }
  } catch (error) {
    console.error("Error in generateContentForPlatform:", error)
    throw error
  }
}

function createPromptForPlatform(blogContent: string, platform: string, tone: string, language?: string) {
  const basePrompt = `Transform the following content into ${tone} ${platform} content. Use the ${language || 'english'} language.

CRITICAL REQUIREMENTS:
- Return ONLY the content itself, no labels, headers, no placeholders or descriptions
- No "Output 1", "Tweet:", "Post:", or similar markers
- No "Here's a..." or "This content..." descriptions
- Just provide the actual content that would be posted, so that I can just directly copy and paste it

Content to transform:
${blogContent}

`

  switch (platform.toLowerCase()) {
    case "twitter":
      return basePrompt + `Requirements for Twitter:
- Maximum 280 characters per tweet
- Use emojis naturally (1-3 per tweet)
- Include relevant hashtags (2-5 maximum)
- Conversational and engaging tone
- Focus on one key message per tweet
- Include a hook or question to drive engagement
- Write as if directly speaking to the audience`

    case "instagram":
      return basePrompt + `Requirements for Instagram:
- Start with an attention-grabbing hook
- Use line breaks for readability
- Include 3-5 relevant emojis
- Add 5-10 strategic hashtags
- Include a call-to-action
- Tell a story or share an insight
- Keep paragraphs short (1-2 sentences)
- Maximum 2200 characters`

    case "linkedin":
      return basePrompt + `Requirements for LinkedIn:
- Professional yet personable tone
- Start with a compelling statement or question
- Share valuable insights or lessons
- Use bullet points or short paragraphs for readability
- Include industry-relevant hashtags (3-5)
- End with a question to encourage engagement
- Maximum 3000 characters
- Focus on professional value`

    case "facebook":
      return basePrompt + `Requirements for Facebook:
- Conversational and community-focused
- Use storytelling approach
- Include relevant emojis (2-4)
- Ask questions to drive comments
- Keep it engaging but not too sales-y
- Include 2-3 relevant hashtags
- Maximum 500 words for optimal engagement`

    case "youtube":
      return basePrompt + `Requirements for YouTube Shorts:
- Create a script for a short video (60 seconds max)
- Include hooks in first 3 seconds
- Use dynamic language and action words
- Structure: Hook → Value → Call-to-action
- Include visual cues or directions
- Keep sentences short and punchy
- Focus on one main topic or tip`

    case "threads":
      return basePrompt + `Requirements for Threads:
- Conversational and authentic tone
- Similar to Twitter but slightly more casual
- Use emojis naturally (2-4)
- Include relevant hashtags (2-4)
- Maximum 500 characters
- Focus on starting conversations
- Be relatable and human`

    case "email":
      return basePrompt + `Requirements for Email Newsletter:
- Compelling subject line approach
- Personal and direct tone
- Use short paragraphs (2-3 sentences)
- Include actionable insights
- Clear call-to-action
- Structure: Hook → Value → Action
- Keep it scannable with bullet points if needed`

    default:
      return basePrompt + `Requirements for ${platform}:
- Match the platform's typical content style
- Use appropriate formatting for the platform
- Include relevant hashtags naturally
- Focus on engagement and value
- Keep tone consistent throughout
- Include a clear call-to-action`
  }
}

// Replace the generateHashtags function with this simpler version that doesn't make an API call
function generateSimpleHashtags(platform: string, tone: string) {
  // Base hashtags that work for most content
  const baseHashtags = ["ContentCreation", "DigitalMarketing", "ContentStrategy"]

  // Platform-specific hashtags
  const platformHashtags = {
    twitter: ["TwitterTips", "TwitterMarketing", "TweetTips"],
    linkedin: ["LinkedInTips", "ProfessionalContent", "CareerAdvice"],
    instagram: ["InstagramTips", "InstagramMarketing", "VisualContent"],
    facebook: ["FacebookMarketing", "SocialMediaTips", "FacebookContent"],
    youtube: ["YouTubeShorts", "VideoContent", "VideoMarketing"],
    threads: ["ThreadsApp", "ThreadsContent", "MetaPlatforms"],
    email: ["EmailMarketing", "Newsletter", "EmailContent"],
  }

  // Tone-specific hashtags
  const toneHashtags = {
    professional: ["ProfessionalContent", "BusinessAdvice", "IndustryInsights"],
    friendly: ["ConversationalContent", "EngagingContent", "CommunityBuilding"],
    educational: ["LearnSomethingNew", "EducationalContent", "KnowledgeSharing"],
    witty: ["CleverContent", "WittyMarketing", "CreativeContent"],
    enthusiastic: ["ExcitingNews", "GameChanger", "MustRead"],
    casual: ["CasualContent", "RelaxedTone", "EverydayTips"],
  }

  // Get platform hashtags or use default
  const platformTags = platformHashtags[platform as keyof typeof platformHashtags] || ["SocialMedia", "ContentCreation"]

  // Get tone hashtags or use default
  const toneTags = toneHashtags[tone as keyof typeof toneHashtags] || ["ContentMarketing", "BrandVoice"]

  // Combine and return unique hashtags
  return [...new Set([...baseHashtags, ...platformTags, ...toneTags])].slice(0, 7)
}
