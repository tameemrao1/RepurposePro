import type { GenerationRequest, GeneratedItem } from "./types"

// This is a mock API function that simulates generating content
export async function mockGenerateContent(request: GenerationRequest): Promise<GeneratedItem[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const results: GeneratedItem[] = []

  // Generate mock content for each platform
  for (const platform of request.platforms) {
    for (let i = 0; i < request.outputCount; i++) {
      let content = ""
      let hashtags: string[] = []

      // Generate platform-specific content based on the blog content
      switch (platform) {
        case "twitter":
          content = generateTwitterContent(request.content, request.tone, i)
          hashtags = ["ContentCreation", "TwitterTips", "DigitalMarketing", "ContentStrategy"]
          break
        case "instagram":
          content = generateInstagramContent(request.content, request.tone, i)
          hashtags = ["InstagramTips", "ContentCreator", "DigitalMarketing", "SocialMediaStrategy"]
          break
        case "linkedin":
          content = generateLinkedInContent(request.content, request.tone, i)
          hashtags = ["ProfessionalDevelopment", "CareerAdvice", "BusinessStrategy", "Leadership"]
          break
        case "facebook":
          content = generateFacebookContent(request.content, request.tone, i)
          hashtags = ["FacebookMarketing", "SocialMediaTips", "DigitalStrategy", "ContentCreation"]
          break
        case "youtube":
          content = generateYouTubeContent(request.content, request.tone, i)
          hashtags = ["YouTubeShorts", "VideoContent", "ContentCreator", "VideoMarketing"]
          break
        case "threads":
          content = generateThreadsContent(request.content, request.tone, i)
          hashtags = ["ThreadsApp", "ContentCreation", "SocialMediaTips", "DigitalMarketing"]
          break
        case "email":
          content = generateEmailContent(request.content, request.tone, i)
          hashtags = ["EmailMarketing", "Newsletter", "ContentStrategy", "DigitalMarketing"]
          break
        default:
          content = generateGenericContent(request.content, request.tone, i)
          hashtags = ["ContentCreation", "DigitalMarketing", "SocialMedia", "ContentStrategy"]
      }

      results.push({
        platform,
        content,
        hashtags,
      })
    }
  }

  return results
}

// Helper functions to generate mock content for different platforms
function generateTwitterContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "Just published a new blog post on content repurposing! Here's the key insight: repurposing your content across platforms can increase your reach by 5x while saving you hours of work. Check it out! 🚀",
    "Content creation taking too much time? Here's a pro tip from my latest blog: One piece of long-form content can be transformed into 10+ platform-specific posts. Work smarter, not harder! 💡",
    "The secret to consistent social media presence? Content repurposing! My latest blog breaks down how to turn one blog post into weeks of content. Thread incoming... 🧵",
  ]

  return excerpts[variant % excerpts.length]
}

function generateInstagramContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "📱 Content Creation Hack #1:\n\nStop creating content from scratch for every platform!\n\nOne blog post can become:\n- 5 carousel posts\n- 10 stories\n- 3 Reels scripts\n- 15 feed posts\n\nWork smarter, not harder. Save this post for your next content planning session! ✨",
    "🔄 REPURPOSE YOUR CONTENT 🔄\n\nThe biggest mistake I see creators make is using their content only ONCE.\n\nSwipe to see how I turn one blog post into 20+ pieces of content across all platforms!\n\nWhich platform gives you the best results? Comment below! 👇",
    "Content creation doesn't have to be overwhelming! 😌\n\nHere's my simple 3-step process for repurposing blog content:\n\n1. Extract key points\n2. Adapt to platform format\n3. Schedule strategically\n\nSave 3+ hours per blog post with this method! ⏱️",
  ]

  return excerpts[variant % excerpts.length]
}

function generateLinkedInContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "I've discovered that 80% of businesses are wasting valuable content assets.\n\nHere's why: They create a piece of content, publish it once, and move on.\n\nBut what if I told you that one well-researched blog post could be transformed into 15+ pieces of platform-specific content?\n\nIn my latest article, I break down the exact process our team uses to repurpose content efficiently, helping our clients increase their content output by 5x without additional resources.\n\nThe key insights:\n\n1. Content atomization is the future of digital marketing\n2. Platform-specific optimization increases engagement by 43%\n3. A systematic repurposing workflow saves an average of 3 hours per blog post\n\nAre you maximizing the value of your content? What's your approach to content repurposing?",
    "Content creation is NOT about quantity.\n\nIt's about LEVERAGE.\n\nI've spent the last 5 years helping businesses scale their content marketing, and the single most effective strategy has been systematic content repurposing.\n\nHere's the framework we use:\n\n1. Create cornerstone content (blog posts, podcasts, videos)\n2. Extract 5-7 key insights from each piece\n3. Transform each insight into platform-optimized micro-content\n4. Distribute across channels with platform-specific formatting\n5. Track performance and double-down on winning formats\n\nThis approach has helped our clients generate 3x more engagement while reducing content creation time by 60%.\n\nWhat's your biggest challenge with content creation?",
    '📊 CONTENT MARKETING CASE STUDY 📊\n\nClient: B2B SaaS company\nChallenge: Limited resources for content creation\nSolution: Implemented our content repurposing system\n\nResults (90 days):\n• 1 blog post per week → 25+ pieces of micro-content\n• 327% increase in LinkedIn engagement\n• 215% growth in newsletter subscribers\n• 5 hours saved per week on content creation\n\nThe key was shifting from a "create more" mindset to a "leverage more" approach.\n\nInstead of creating new content constantly, we focused on extracting maximum value from each piece through strategic repurposing.\n\nWant to learn our exact process? Check out the link in my profile.',
  ]

  return excerpts[variant % excerpts.length]
}

function generateFacebookContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "Content creation hack that saved me 10+ hours last week! 🕒\n\nI've been using a content repurposing system that turns one blog post into multiple pieces of content for every platform.\n\nHere's how it works:\n\n1️⃣ Write one comprehensive blog post\n2️⃣ Break it into platform-specific chunks\n3️⃣ Adapt the format for each platform\n4️⃣ Schedule across the week\n\nThis approach has helped me maintain a consistent presence across all platforms without burning out.\n\nWho else struggles with creating enough content? Drop a ✋ below if you want more tips like this!",
    "Just published a new blog post about content repurposing! 📝\n\nDid you know that most successful content creators don't actually create new content every day?\n\nInstead, they're masters at repurposing - taking one piece of content and adapting it for different platforms.\n\nCheck out the full post for a step-by-step guide on how to turn one blog post into 20+ pieces of content! Link in comments. 👇\n\nWhat's your biggest content creation challenge?",
    "Content creation doesn't have to be overwhelming! 😌\n\nI used to spend hours creating unique content for each platform until I discovered the power of strategic repurposing.\n\nNow I follow this simple workflow:\n\n🔹 Monday: Publish blog post\n🔹 Tuesday: Create social media graphics\n🔹 Wednesday: Record video snippets\n🔹 Thursday: Draft email newsletter\n🔹 Friday: Schedule everything for next week\n\nThis system has helped me 5x my content output while actually working LESS.\n\nTag someone who needs to see this! 👇",
  ]

  return excerpts[variant % excerpts.length]
}

function generateYouTubeContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "YOUTUBE SHORTS SCRIPT:\n\n[Hook - look directly at camera]\nWant to know how I create content for 7 platforms but only work 4 hours a week?\n\n[Point 1 - gesture to the side]\nContent repurposing! I create ONE piece of cornerstone content each week.\n\n[Point 2 - hold up two fingers]\nThen I transform it into platform-specific formats using my 3-step system.\n\n[Point 3 - lean in closer]\nThis saves me 15+ hours every week while growing my audience on every platform.\n\n[Call to action]\nSwipe up to read my full guide on content repurposing or comment 'GUIDE' below!",
    "YOUTUBE SHORTS SCRIPT:\n\n[Start with statistic on screen]\nDid you know that 65% of content creators burn out within their first year?\n\n[Reveal face]\nThe number one reason? Creating too much content from scratch.\n\n[Show phone/computer screen]\nHere's my content repurposing workflow that helps me create 30+ pieces of content from just ONE blog post.\n\n[Show process quickly]\n1. Extract key points\n2. Create templates for each platform\n3. Adapt and optimize\n\n[End with hook]\nThis system saved me 20 hours last month. Full tutorial on my channel now!",
    "YOUTUBE SHORTS SCRIPT:\n\n[Start with question]\nStruggling to keep up with content creation?\n\n[Transition to solution]\nHere's how top creators maintain a consistent presence without burning out.\n\n[Reveal the secret]\nThey don't create new content every day. They REPURPOSE strategically.\n\n[Show example]\nOne blog post becomes:\n- 3 YouTube videos\n- 5 TikToks\n- 7 Instagram posts\n- 10 Twitter posts\n\n[End with value proposition]\nI'm sharing my entire repurposing system in my latest video. Link in bio!",
  ]

  return excerpts[variant % excerpts.length]
}

function generateThreadsContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "Content repurposing is the secret weapon of productive creators.\n\nHere's how to turn one blog post into a week's worth of content in just 30 minutes:",
    "The biggest content creation myth: you need to create fresh content every day.\n\nThe truth? Smart creators repurpose one piece of content across multiple platforms.\n\nHere's how:",
    "I used to spend 20+ hours a week creating content. Now I spend 4.\n\nThe difference? A systematic content repurposing workflow that looks like this:",
  ]

  return excerpts[variant % excerpts.length]
}

function generateEmailContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "Subject: The Content Creation Hack That Saved Me 10 Hours Last Week\n\nHey [Name],\n\nEver feel like you're on a never-ending content creation hamster wheel?\n\nI get it. For years, I was creating new content from scratch for every platform, every day. It was exhausting, time-consuming, and frankly, unsustainable.\n\nThat's when I discovered the power of strategic content repurposing.\n\nIn my latest blog post, I break down my exact system for turning one piece of cornerstone content into 15+ platform-optimized pieces.\n\nHere's a quick preview of what you'll learn:\n\n• Why creating from scratch is killing your productivity\n• The 3-step content repurposing framework I use with all my clients\n• How to adapt content for each platform's unique algorithm\n• My favorite tools that make repurposing almost automatic\n\nThis system has helped me reduce my content creation time by 70% while actually increasing my engagement and reach.\n\nCheck out the full post here: [LINK]\n\nHave you tried content repurposing before? Hit reply and let me know your experience - I read every email!\n\nBest,\n[Your Name]",
    "Subject: Stop Creating So Much Content (Do This Instead)\n\nHey [Name],\n\nI have a confession to make...\n\nI don't create new content every day. Not even close.\n\nYet I maintain an active presence across 7 different platforms, publishing 25+ pieces of content weekly.\n\nHow? Content repurposing.\n\nIn my latest blog post, I'm pulling back the curtain on my entire content repurposing system - the same one that's helped my clients save an average of 15 hours per week while growing their audience.\n\nYou'll discover:\n\n• The Content Multiplication Matrix (turn 1 idea into 20+ pieces)\n• Platform-specific formatting guidelines\n• My step-by-step repurposing workflow\n• Automation tools that do 80% of the work for you\n\nIf you're tired of the content creation grind, this might be the most important post you read this year.\n\nRead it here: [LINK]\n\nTo working smarter, not harder,\n[Your Name]\n\nP.S. I'm hosting a free workshop next week where I'll demonstrate this system live. Save your seat here: [LINK]",
    "Subject: How I Create a Month of Content in Just One Day\n\nHey [Name],\n\nContent creation doesn't have to be a daily grind.\n\nIn fact, I create an entire month's worth of content in just ONE day using a systematic repurposing approach.\n\nI just published a comprehensive guide breaking down my exact process, and I thought you might find it valuable.\n\nIn this guide, you'll learn:\n\n• The Content Ecosystem Method - how to build a content system rather than isolated pieces\n• My 1:10 Content Ratio - how one cornerstone piece becomes 10 platform-specific assets\n• The Repurposing Workflow - a step-by-step process you can implement immediately\n• Content Transformation Templates - formulas for adapting content to any platform\n\nThis approach has been a game-changer for me and hundreds of my clients who were previously overwhelmed by content creation demands.\n\nRead the full guide here: [LINK]\n\nI'd love to hear your thoughts after you check it out!\n\nBest,\n[Your Name]",
  ]

  return excerpts[variant % excerpts.length]
}

function generateGenericContent(blogContent: string, tone: string, variant: number): string {
  const excerpts = [
    "Content repurposing is the art of taking one piece of content and adapting it for multiple platforms and formats. This approach saves time, extends the lifespan of your ideas, and helps you reach different audience segments.\n\nHere's a simple framework for effective content repurposing:\n\n1. Create cornerstone content (blog post, podcast, video)\n2. Extract key points, quotes, and statistics\n3. Adapt for each platform's unique format and audience\n4. Schedule strategically across platforms\n5. Track performance and optimize\n\nBy implementing this system, you can transform one blog post into dozens of platform-specific pieces, saving hours of creation time while maximizing your content's reach and impact.",
    "The secret to consistent content creation isn't working harder—it's working smarter through strategic repurposing.\n\nContent repurposing allows you to:\n• Extend the lifespan of your best ideas\n• Reach audiences across multiple platforms\n• Reinforce your message through repetition\n• Save significant time and creative energy\n• Test different formats to find what resonates\n\nThe most successful content creators don't create more—they leverage what they create more effectively. By building a systematic approach to content repurposing, you can maintain a consistent presence across all relevant platforms without the burnout that comes from constant creation.",
    "Content repurposing is the most underutilized strategy in digital marketing. While most creators focus on creating more content, the real opportunity lies in extracting maximum value from each piece you create.\n\nA strategic repurposing workflow includes:\n\n• Content atomization - breaking down comprehensive pieces into smaller components\n• Format transformation - adapting content for different mediums (text, audio, video, graphics)\n• Platform optimization - tailoring content to each platform's unique requirements\n• Audience customization - adjusting messaging for different segments\n• Strategic scheduling - distributing repurposed content for maximum impact\n\nImplementing this approach can reduce content creation time by up to 70% while actually increasing your overall output and reach.",
  ]

  return excerpts[variant % excerpts.length]
}
