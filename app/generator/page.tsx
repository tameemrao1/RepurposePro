"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sparkles, LinkIcon, Loader2, AlertCircle, Upload, FileText, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useSimpleNotifications } from "@/hooks/use-simple-notifications"
import GeneratedContent from "@/components/generated-content"
import PlatformSelector from "@/components/platform-selector"
import ToneSelector from "@/components/tone-selector"
import { ToastDebug } from "@/components/toast-debug"
import { platforms, tones } from "@/lib/data"
import { TopBar } from "@/components/top-bar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  generateContent,
  trackUsage,
  trackActivity,
  extractContentFromUrl,
  addNotification,
  regenerateContent,
} from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/file-upload"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Generator() {
  const [blogContent, setBlogContent] = useState("")
  const [blogUrl, setBlogUrl] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedTone, setSelectedTone] = useState("")
  const [outputCount, setOutputCount] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any[]>([])
  const [inputMethod, setInputMethod] = useState<"text" | "url" | "file">("text")
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isReadingFile, setIsReadingFile] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { showToast } = useSimpleNotifications()
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.push('/login')
      }
    }
    checkSession()
  }, [supabase, router])

  const handleFetchUrl = async () => {
    if (!blogUrl) {
      showToast("Missing URL", "Please enter a valid blog URL to fetch content.", "warning")
      return
    }

    // Validate URL format
    try {
      new URL(blogUrl)
    } catch (error) {
      showToast("Invalid URL", "Please enter a valid URL including http:// or https://", "warning")
      return
    }

    setIsFetchingUrl(true)
    setError(null)

    try {
      showToast("Fetching content", "Extracting content from the provided URL...", "info")

      // Call the API to extract content from the URL
      const extractedContent = await extractContentFromUrl(blogUrl)
      setBlogContent(extractedContent)

      showToast("Content extracted", "Successfully extracted content from the URL.", "success")
    } catch (error) {
      console.error("Error fetching URL:", error)
      setError("Failed to extract content from the URL. Please try again or paste the content manually.")
      showToast("Extraction failed", "Failed to extract content from the URL. Please try again or paste the content manually.", "error")
    } finally {
      setIsFetchingUrl(false)
    }
  }

  const handleFileContent = (content: string) => {
    setBlogContent(content)
  }

  const handleFileError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const simulateGenerationProgress = () => {
    setGenerationProgress(0)
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)

    return () => clearInterval(interval)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)
    setGenerationProgress(0)
    // Don't clear previous content immediately - wait until we have new content

    try {
      // Check session before proceeding
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

    if (!blogContent.trim()) {
      showToast("Missing content", "Please paste your blog content to continue.", "warning")
      setIsGenerating(false)
      return
    }

    if (selectedPlatforms.length === 0) {
      showToast("Select platforms", "Please select at least one platform.", "warning")
      setIsGenerating(false)
      return
    }

    if (!selectedTone) {
      showToast("Select tone", "Please select a tone for your content.", "warning")
      setIsGenerating(false)
      return
    }

      // Calculate total number of items to be generated
      const totalItems = selectedPlatforms.length * outputCount
      let completedItems = 0

      // Update progress based on completed items
      const updateProgress = () => {
        completedItems++
        const progress = (completedItems / totalItems) * 100
        setGenerationProgress(Math.min(progress, 100))
      }

      const results = await generateContent({
        content: blogContent,
        platforms: selectedPlatforms,
        tone: selectedTone,
        outputCount,
        onProgress: updateProgress,
      })

      console.log('Raw API results:', results); // Debug log

      // Process and clean up the results with less aggressive cleaning
      const cleanResults = results
        .filter(result => result && result.content) // Remove null/undefined results
        .map((result, index) => {
          let cleanContent = result.content || '';
          console.log(`Processing result ${index} for ${result.platform}:`, cleanContent); // Debug log
          
          // Less aggressive content cleaning - only remove obvious markers
          cleanContent = cleanContent
            .trim()
            // Remove only obvious output markers
            .replace(/^\[Tweet \d+\][\s:]*/gi, '')
            .replace(/^Output \d+[\s:.\-]*/gi, '')
            .replace(/^Post \d+[\s:.\-]*/gi, '')
            .replace(/^Caption \d+[\s:.\-]*/gi, '')
            .replace(/^Content \d+[\s:.\-]*/gi, '')
            
            // Remove platform markers only at the beginning
            .replace(/^\[(Twitter|Instagram|LinkedIn|Facebook|YouTube|Threads|Email)\][\s:]*/gi, '')
            .replace(/^(Twitter|Instagram|LinkedIn|Facebook|YouTube|Threads|Email) Post[\s:.\-]*/gi, '')
            
            // Clean up excessive whitespace
            .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
            .replace(/\s{2,}/g, ' ') // Replace multiple spaces
            
            // Remove empty lines at start and end
            .trim();
          
          console.log(`Cleaned content for ${result.platform}:`, cleanContent); // Debug log
          
          // Only mark as error if content is extremely short or obviously an error
          if (cleanContent.length < 5) {
            console.log(`Content too short for ${result.platform}, marking as error`);
            cleanContent = `Content generation incomplete for ${result.platform}. Please try regenerating.`;
          }
          
          return {
            ...result,
            content: cleanContent,
            hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
            viralScore: typeof result.viralScore === 'number' ? result.viralScore : null,
            seoScore: typeof result.seoScore === 'number' ? result.seoScore : null
          };
        })
        .filter(result => result.content.length > 0); // Remove results with empty content

      console.log('Final cleaned results:', cleanResults); // Debug log
      setGeneratedContent(cleanResults)

      // Track the activity for each generated content
      let successCount = 0
      for (const result of cleanResults) {
        try {
        await trackActivity({
          type: "generation",
          title: `Generated content for ${result.platform}`,
          content: result.content,
          platforms: [result.platform],
            hashtags: result.hashtags || [],
          outputs: 1,
        })
          successCount++
        } catch (trackError) {
          console.error('Error tracking activity:', trackError)
          // Don't show error toast for tracking failures as it's not critical for user experience
        }
      }

      if (successCount > 0) {
        const platformNames = [...new Set(cleanResults.map(r => r.platform))].join(", ")
        const message = cleanResults.length === 1 
          ? `Content generated for ${platformNames}` 
          : `${cleanResults.length} pieces of content generated for ${platformNames}`
        
        showToast("Content Ready!", message, "success", 5000)
      } else if (cleanResults.length > 0) {
        // Content was generated but tracking failed - still show success
        const platformNames = [...new Set(cleanResults.map(r => r.platform))].join(", ")
        const message = cleanResults.length === 1 
          ? `Content generated for ${platformNames}` 
          : `${cleanResults.length} pieces of content generated for ${platformNames}`
        
        showToast("Content Ready!", message, "success", 5000)
      }

      // Ensure progress shows 100% when complete
      setGenerationProgress(100)
    } catch (error: any) {
      console.error('Generation error:', error)
      console.error('Error stack:', error.stack)
      setError(error instanceof Error ? error.message : "Failed to generate content")
      showToast(
        "Generation Failed",
        error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        "error"
      )
      setGenerationProgress(0)
      // Make sure we clear any partial content on error
      setGeneratedContent([])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateItem = async (platform: string, index: number): Promise<void> => {
    // Find the original content
    const originalItem = generatedContent.find((item, i) => item.platform === platform && i === index)

    if (!originalItem) {
      showToast("Regeneration failed", "Could not find the original content to regenerate.", "error")
      return
    }

    try {
      // Call the API to regenerate the content
      const regeneratedItem = await regenerateContent(originalItem.content, platform, selectedTone)

      // Update the content in the state
      const updatedContent = [...generatedContent]
      const itemIndex = updatedContent.findIndex((item, i) => item.platform === platform && i === index)

      if (itemIndex !== -1) {
        updatedContent[itemIndex] = regeneratedItem
        setGeneratedContent(updatedContent)

        // Track the regenerated content
        await trackActivity({
          type: "regeneration",
          title: `Regenerated content for ${platform}`,
          content: regeneratedItem.content,
          platforms: [platform],
          hashtags: regeneratedItem.hashtags || [],
          outputs: 1,
        })
      }

      showToast("Content regenerated", "Successfully regenerated content.", "success")
    } catch (error) {
      console.error("Error regenerating content:", error)
      showToast("Regeneration failed", error instanceof Error ? error.message : "Failed to regenerate content", "error")
    }
  }

  const clearForm = () => {
    setBlogContent("")
    setBlogUrl("")
    setSelectedPlatforms([])
    setSelectedTone("")
    setOutputCount(1)
    setGeneratedContent([])
    setError(null)
    setInputMethod("text")
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }



  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-0 left-0 right-0 z-10">
        <TopBar title="Content Generator" />
      </div>

      <div className="absolute top-16 left-0 right-0 bottom-0 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Generate Content</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-2">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <Tabs
                          defaultValue="text"
                          value={inputMethod}
                          onValueChange={(value) => setInputMethod(value as "text" | "url" | "file")}
                          className="w-full mb-4"
                        >
                          <TabsList className="grid w-full grid-cols-3 mb-2">
                            <TabsTrigger value="text" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Paste Text
                            </TabsTrigger>
                            <TabsTrigger value="url" className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              Enter URL
                            </TabsTrigger>
                            <TabsTrigger value="file" className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Upload File
                            </TabsTrigger>
                          </TabsList>

                          {/* Text Input Tab */}
                          <TabsContent value="text" className="mt-4">
                            <Label htmlFor="blog-content" className="text-base font-medium block mb-2">
                              Paste your blog content
                            </Label>
                            <Textarea
                              id="blog-content"
                              placeholder="Paste your blog post here..."
                              className="min-h-[200px] resize-none focus-visible:ring-primary"
                              value={blogContent}
                              onChange={(e) => setBlogContent(e.target.value)}
                            />
                          </TabsContent>

                          {/* URL Input Tab */}
                          <TabsContent value="url" className="mt-4">
                            <Label htmlFor="blog-url" className="text-base font-medium block mb-2">
                              Enter blog URL
                            </Label>
                            <div className="flex gap-2 flex-col sm:flex-row">
                              <Input
                                id="blog-url"
                                type="url"
                                placeholder="https://example.com/blog-post"
                                value={blogUrl}
                                onChange={(e) => setBlogUrl(e.target.value)}
                                className="flex-1"
                                disabled={isFetchingUrl}
                              />
                              <Button
                                type="button"
                                onClick={handleFetchUrl}
                                disabled={isFetchingUrl}
                                className="min-w-[80px]"
                              >
                                {isFetchingUrl ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Fetching...
                                  </>
                                ) : (
                                  "Fetch"
                                )}
                              </Button>
                            </div>
                            {error && inputMethod === "url" && (
                              <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}
                            {blogContent && inputMethod === "url" && (
                              <div className="mt-4">
                                <Label className="text-base font-medium block mb-2">Extracted Content</Label>
                                <div className="border rounded-md p-3 bg-muted/30 max-h-40 overflow-y-auto text-sm">
                                  {blogContent.substring(0, 300)}
                                  {blogContent.length > 300 && "..."}
                                </div>
                              </div>
                            )}
                          </TabsContent>

                          {/* File Upload Tab */}
                          <TabsContent value="file" className="mt-4">
                            <Label htmlFor="file-upload" className="text-base font-medium block mb-2">
                              Upload blog file
                            </Label>

                            <FileUpload
                              onFileContent={handleFileContent}
                              onError={handleFileError}
                              accept=".txt,.md,.html,.docx,.doc"
                              maxSize={5}
                            />

                            {blogContent && inputMethod === "file" && !isReadingFile && (
                              <div className="mt-4">
                                <Label className="text-base font-medium block mb-2">File Content</Label>
                                <div className="border rounded-md p-3 bg-muted/30 max-h-40 overflow-y-auto text-sm">
                                  {blogContent.substring(0, 300)}
                                  {blogContent.length > 300 && "..."}
                                </div>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div>
                        <Label className="text-base font-medium block mb-3">Select platforms</Label>
                        <PlatformSelector
                          platforms={platforms}
                          selectedPlatforms={selectedPlatforms}
                          setSelectedPlatforms={setSelectedPlatforms}
                        />
                      </div>

                      <div>
                        <Label className="text-base font-medium block mb-2 sm:mb-3">Select tone</Label>
                        <ToneSelector tones={tones} selectedTone={selectedTone} setSelectedTone={setSelectedTone} />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-base font-medium">Number of outputs per platform</Label>
                          <span className="font-medium text-primary">{outputCount}</span>
                        </div>
                        <Slider
                          value={[outputCount]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => setOutputCount(value[0])}
                          className="my-4"
                        />
                      </div>

                      {/* <div>
                        <Label className="text-base font-medium block mb-2">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="italian">Italian</SelectItem>
                            <SelectItem value="portuguese">Portuguese</SelectItem>
                            <SelectItem value="japanese">Japanese</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}

                      {error && inputMethod === "text" && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearForm}
                          disabled={isGenerating}
                          className="w-full"
                        >
                          Clear
                        </Button>
                        <Button type="submit" className="w-full" disabled={isGenerating} size="lg">
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5" />
                              Generate Content
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isGenerating ? (
                <Card className="h-full shadow-sm">
                  <CardContent className="p-6 h-full flex flex-col items-center justify-center">
                    <div className="text-center p-4 sm:p-8 max-w-md">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Generating content...</h3>
                      <p className="text-muted-foreground mb-6">
                        We're crafting high-quality content for your selected platforms. This may take a moment.
                      </p>

                      <div className="w-full max-w-md mx-auto mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.min(Math.round(generationProgress), 100)}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Analyzing content, determining key points, and optimizing for each platform...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : generatedContent.length > 0 ? (
                <GeneratedContent
                  content={generatedContent}
                  platforms={platforms}
                  onRegenerateItem={handleRegenerateItem}
                />
              ) : (
                <Card className="h-full shadow-sm">
                  <CardContent className="p-6 h-full flex items-center justify-center">
                    <div className="text-center p-4 sm:p-8 max-w-md">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No content generated yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Paste your blog content, select platforms and tone, then click "Generate Content" to see
                        AI-generated outputs here.
                      </p>
                      <Button
                        onClick={() => document.getElementById("blog-content")?.focus()}
                        className="w-full sm:w-auto"
                      >
                        Get Started
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>
      <ToastDebug />
    </div>
  )
}
