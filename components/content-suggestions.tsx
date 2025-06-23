"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Hash, MessageCircle, Smile } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContentSuggestionsProps {
  platform: string
  onApplySuggestion: (type: string, suggestion: string) => void
  onGenerateMoreSuggestions?: (type: string) => Promise<void>
}

export function ContentSuggestions({
  platform,
  onApplySuggestion,
  onGenerateMoreSuggestions,
}: ContentSuggestionsProps) {
  const [activeTab, setActiveTab] = useState("hashtags")
  const [isGenerating, setIsGenerating] = useState(false)

  // Static suggestions based on platform
  const suggestions = {
    hashtags: getPlatformHashtags(platform),
    captions: getPlatformCaptions(platform),
    emojis: getCommonEmojis(),
  }

  const handleGenerateMore = async (type: string) => {
    if (!onGenerateMoreSuggestions) return

    setIsGenerating(true)
    try {
      await onGenerateMoreSuggestions(type)
      toast({
        title: "Suggestions generated",
        description: `New ${type} suggestions have been generated.`,
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate new suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted/50 p-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">Content Suggestions</h3>
        {onGenerateMoreSuggestions && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1"
            onClick={() => handleGenerateMore(activeTab)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate More
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="hashtags" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none px-2 h-10">
          <TabsTrigger value="hashtags" className="data-[state=active]:bg-muted gap-1">
            <Hash className="h-3.5 w-3.5" />
            Hashtags
          </TabsTrigger>
          <TabsTrigger value="captions" className="data-[state=active]:bg-muted gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            Captions
          </TabsTrigger>
          <TabsTrigger value="emojis" className="data-[state=active]:bg-muted gap-1">
            <Smile className="h-3.5 w-3.5" />
            Emojis
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[200px]">
          <TabsContent value="hashtags" className="p-3 m-0">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.hashtags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onApplySuggestion("hashtag", tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="captions" className="p-3 m-0">
            <div className="space-y-2">
              {suggestions.captions.map((caption, index) => (
                <div
                  key={index}
                  className="p-2 rounded border hover:bg-muted cursor-pointer text-sm"
                  onClick={() => onApplySuggestion("caption", caption)}
                >
                  {caption}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emojis" className="p-3 m-0">
            <div className="grid grid-cols-8 gap-1">
              {suggestions.emojis.map((emoji, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center h-8 w-8 rounded hover:bg-muted cursor-pointer text-lg"
                  onClick={() => onApplySuggestion("emoji", emoji)}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

// Helper functions to get platform-specific suggestions
function getPlatformHashtags(platform: string): string[] {
  const commonHashtags = ["contentcreator", "digitalmarketing", "socialmedia", "contentstrategy"]

  const platformSpecific: Record<string, string[]> = {
    twitter: ["twittermarketing", "twitterstrategy", "tweetoftheday", "twittergrowth", "twittertips"],
    instagram: ["instagrammarketing", "instagramgrowth", "instagramstrategy", "instagramtips", "igdaily"],
    linkedin: ["linkedinmarketing", "linkedinstrategy", "linkedintips", "professionalbranding", "thoughtleadership"],
    facebook: ["facebookmarketing", "facebookstrategy", "facebooktips", "facebookgrowth", "fbmarketing"],
    youtube: ["youtubemarketing", "youtubegrowth", "youtubetips", "youtubestrategy", "youtubeaudience"],
    threads: ["threadsapp", "threadscontent", "threadsmarketing", "threadsstrategy", "threadstips"],
    email: ["emailmarketing", "emailstrategy", "emailtips", "newslettertips", "emailgrowth"],
  }

  return [...(platformSpecific[platform] || []), ...commonHashtags]
}

function getPlatformCaptions(platform: string): string[] {
  const commonCaptions = [
    "What are your thoughts on this?",
    "Tag someone who needs to see this!",
    "Have you tried this before?",
    "Let me know what you think in the comments!",
    "Share this with someone who would find it useful!",
  ]

  const platformSpecific: Record<string, string[]> = {
    twitter: [
      "RT if you agree!",
      "What's your take on this? 👇",
      "Thread incoming...",
      "Hot take:",
      "Unpopular opinion:",
    ],
    instagram: [
      "Double tap if you agree! ❤️",
      "Save this post for later!",
      "Tag your friends in the comments!",
      "Follow for more content like this!",
      "Link in bio for more details!",
    ],
    linkedin: [
      "Agree or disagree?",
      "What's been your experience with this?",
      "I'd love to hear your professional opinion on this.",
      "What would you add to this list?",
      "Has this worked for you in your career?",
    ],
    facebook: [
      "Share if you found this helpful!",
      "Tag a friend who needs to see this!",
      "Comment with your experience!",
      "Like and follow for more content!",
      "What would you add to this?",
    ],
    youtube: [
      "Don't forget to like and subscribe!",
      "Hit the notification bell for more videos like this!",
      "Comment your questions below!",
      "Check out the description for more info!",
      "What video would you like to see next?",
    ],
    threads: [
      "Thoughts?",
      "Adding to the conversation...",
      "Continuing from my previous thread...",
      "A quick insight:",
      "Sharing this perspective:",
    ],
    email: [
      "Reply to this email with your thoughts!",
      "Forward this to a friend who might find it useful!",
      "Click the link below for more information!",
      "Let me know if you have any questions!",
      "PS: Don't miss our next newsletter!",
    ],
  }

  return [...(platformSpecific[platform] || []), ...commonCaptions]
}

function getCommonEmojis(): string[] {
  return [
    "😊",
    "👍",
    "🔥",
    "💯",
    "🙌",
    "✨",
    "📈",
    "🚀",
    "💡",
    "👀",
    "🎉",
    "🤔",
    "💪",
    "🌟",
    "📱",
    "💻",
    "📊",
    "🔍",
    "📝",
    "🎯",
    "⚡",
    "💰",
    "🏆",
    "📢",
    "🌈",
    "❤️",
    "👏",
    "🤩",
    "😍",
    "🙏",
    "👋",
    "🎯",
    "💬",
    "📣",
    "🔔",
    "📌",
    "🔎",
    "📲",
    "🔗",
    "📅",
  ]
}
