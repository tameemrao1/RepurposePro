"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download, Share2, Edit, RefreshCw, Loader2, Languages, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Platform } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addNotification } from "@/lib/api"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ContentSuggestions } from "@/components/content-suggestions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface GeneratedContentProps {
  content: any[]
  platforms: Platform[]
  onRegenerateItem?: (platform: string, index: number) => Promise<void>
}

export default function GeneratedContent({ content, platforms, onRegenerateItem }: GeneratedContentProps) {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<any | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [isRegenerating, setIsRegenerating] = useState<Record<string, boolean>>({})
  const [selectedLanguage, setSelectedLanguage] = useState("english")

  const getPlatformById = (id: string) => {
    return platforms.find((p) => p.id === id)
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMap({ ...copiedMap, [id]: true })

    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    })

    setTimeout(() => {
      setCopiedMap({ ...copiedMap, [id]: false })
    }, 2000)
  }

  const handleDownload = (content: any) => {
    const platformInfo = getPlatformById(content.platform)
    const platformName = platformInfo?.name || content.platform
    const fileName = `${platformName.toLowerCase().replace(/\s+/g, "-")}-content-${Date.now()}.txt`

    const element = document.createElement("a")
    const file = new Blob([content.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Content downloaded",
      description: `Content has been downloaded as ${fileName}`,
    })

    addNotification({
      title: "Content Downloaded",
      message: `Content for ${platformName} has been downloaded`,
      type: "info",
    })
  }

  const handleShare = (content: any) => {
    setSelectedContent(content)
    setShareDialogOpen(true)
  }

  const shareContent = (method: string) => {
    if (!selectedContent) return

    const platformInfo = getPlatformById(selectedContent.platform)
    const platformName = platformInfo?.name || selectedContent.platform

    // In a real app, this would share to the selected platform
    toast({
      title: `Share to ${method}`,
      description: `Content would be shared to ${method} in a production environment.`,
    })

    setShareDialogOpen(false)

    addNotification({
      title: "Content Shared",
      message: `Content for ${platformName} has been shared to ${method}`,
      type: "success",
    })
  }

  const handleEdit = (item: any) => {
    setEditingContent(item)
    setEditedContent(item.content)
    setEditDialogOpen(true)
  }

  const saveEditedContent = () => {
    if (!editingContent) return

    // Update the content in the local state
    const updatedContent = content.map((item) => {
      if (item === editingContent) {
        return { ...item, content: editedContent }
      }
      return item
    })

    // In a real app, you would save this to your backend
    toast({
      title: "Content updated",
      description: "Your edited content has been saved.",
    })

    setEditDialogOpen(false)
  }

  const handleRegenerate = async (platform: string, index: number) => {
    if (!onRegenerateItem) return

    const regenerationId = `${platform}-${index}`
    setIsRegenerating({ ...isRegenerating, [regenerationId]: true })

    try {
      await onRegenerateItem(platform, index)

      toast({
        title: "Content regenerated",
        description: "New content has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Regeneration failed",
        description: "Failed to regenerate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating({ ...isRegenerating, [regenerationId]: false })
    }
  }

  const handleApplySuggestion = (type: string, suggestion: string) => {
    if (!editingContent) return

    if (type === "hashtag") {
      setEditedContent((prev) => `${prev} #${suggestion} `)
    } else if (type === "caption") {
      setEditedContent((prev) => `${prev}\n\n${suggestion}`)
    } else if (type === "emoji") {
      setEditedContent((prev) => `${prev} ${suggestion} `)
    }

    toast({
      title: "Suggestion applied",
      description: `The ${type} has been added to your content.`,
    })
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)

    // In a real app, this would trigger content regeneration in the selected language
    toast({
      title: "Language changed",
      description: `Content will now be generated in ${language}.`,
    })
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>Generated Content</CardTitle>
          {/* <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <SelectValue placeholder="Select language" />
                </div>
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={content[0]?.platform} className="w-full">
            <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1">
              {Array.from(new Set(content.map((item) => item.platform))).map((platform) => {
                const platformInfo = getPlatformById(platform)
                return (
                  <TabsTrigger key={platform} value={platform} className="flex items-center">
                    {platformInfo?.icon && <platformInfo.icon className="mr-2 h-4 w-4" />}
                    {platformInfo?.name || platform}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {Array.from(new Set(content.map((item) => item.platform))).map((platform) => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                {content
                  .filter((item) => item.platform === platform)
                  .map((item, index) => (
                    <motion.div
                      key={`${platform}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <CardTitle className="text-base">Output {index + 1}</CardTitle>
                          <div className="flex items-center flex-wrap gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(item.content, `${platform}-${index}`)}
                              className="h-8 w-8 p-0"
                              aria-label="Copy content"
                            >
                              {copiedMap[`${platform}-${index}`] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0"
                              aria-label="Edit content"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(item)}
                              className="h-8 w-8 p-0"
                              aria-label="Download content"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(item)}
                              className="h-8 w-8 p-0"
                              aria-label="Share content"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            {onRegenerateItem && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegenerate(platform, index)}
                                className="h-8 w-8 p-0"
                                aria-label="Regenerate content"
                                disabled={isRegenerating[`${platform}-${index}`]}
                              >
                                {isRegenerating[`${platform}-${index}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {item.content ? (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded">
                              No content generated for this item. Please try regenerating.
                            </div>
                          )}

                          {/* AI-Powered Viral and SEO scores */}
                          {(typeof item.viralScore === 'number' || typeof item.seoScore === 'number') && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-md border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">AI Insights</span>
                              </div>
                              <div className="flex flex-wrap gap-3">
                              {typeof item.viralScore === 'number' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">🔥 Viral:</span>
                                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                                    item.viralScore >= 80 ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50' :
                                    item.viralScore >= 60 ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/50' :
                                    'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
                                  }`}>
                                    {item.viralScore}%
                                  </span>
                                </div>
                              )}
                              {typeof item.seoScore === 'number' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">📊 SEO:</span>
                                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                                    item.seoScore >= 80 ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50' :
                                    item.seoScore >= 60 ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/50' :
                                    'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
                                  }`}>
                                    {item.seoScore}%
                                  </span>
                                </div>
                              )}
                              </div>
                            </div>
                          )}

                          {item.hashtags && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1">Suggested Hashtags:</h4>
                              <div className="flex flex-wrap gap-1">
                                {item.hashtags.map((tag: string, i: number) => (
                                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Content</DialogTitle>
            <DialogDescription>Choose where you want to share this content</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-2 py-4">
              <Button variant="outline" onClick={() => shareContent("Twitter")} className="justify-start">
                Twitter/X
              </Button>
              <Button variant="outline" onClick={() => shareContent("LinkedIn")} className="justify-start">
                LinkedIn
              </Button>
              <Button variant="outline" onClick={() => shareContent("Facebook")} className="justify-start">
                Facebook
              </Button>
              <Button variant="outline" onClick={() => shareContent("Instagram")} className="justify-start">
                Instagram
              </Button>
              <Button variant="outline" onClick={() => shareContent("Email")} className="justify-start">
                Email
              </Button>
              <Button variant="outline" onClick={() => shareContent("Buffer")} className="justify-start">
                Buffer
              </Button>
            </div>
          </ScrollArea>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditDialogOpen(false)
          setEditingContent(null)
          setEditedContent("")
        }
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Make changes to your content using the editor below</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] resize-none"
              placeholder="Enter your content here..."
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false)
              setEditingContent(null)
              setEditedContent("")
            }}>
              Cancel
            </Button>
            <Button onClick={saveEditedContent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
