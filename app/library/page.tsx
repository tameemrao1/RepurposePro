"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  Calendar,
  Copy,
  MoreHorizontal,
  Search,
  Trash2,
  X,
  Edit,
  Download,
  Share2,
  Filter,
  FileText,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getRecentActivity, searchActivity, filterActivityByDate, saveContentItem, deleteContentItem, shareContent } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { platforms } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ContentLibrary() {
  const [contentItems, setContentItems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [isFiltered, setIsFiltered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<any | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadContentItems()
    checkUrlParams()

    // Set up real-time subscription for content updates
    const channel = supabase
      .channel('content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_content'
        },
        () => {
          // Reload content when changes occur
          loadContentItems()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const checkUrlParams = async () => {
    const params = new URLSearchParams(window.location.search)
    const searchParam = params.get("search")
    const platformParam = params.get("platform")

    if (searchParam) {
      setSearchQuery(searchParam)
      const results = await searchActivity(searchParam)
      setContentItems(results)
      setIsFiltered(true)
    }

    if (platformParam && ["twitter", "instagram", "linkedin", "facebook", "youtube", "threads", "email"].includes(platformParam)) {
      setActiveTab(platformParam)
      await filterItemsByPlatform(platformParam)
    }
  }

  const loadContentItems = async () => {
    if (isFiltered) return // Don't reload if filters are applied
    
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      const activity = await getRecentActivity()
    setContentItems(activity)
    setIsFiltered(false)
    setSearchQuery("")
    setDateRange({ from: undefined, to: undefined })
    } catch (error) {
      console.error('Error loading content items:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load content items",
      })
    } finally {
    setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      if (!searchQuery.trim()) {
        const activity = await getRecentActivity()
        setContentItems(activity)
        setIsFiltered(false)
        return
      }

      const results = await searchActivity(searchQuery)
      setContentItems(results)
      setIsFiltered(true)
    } catch (error) {
      console.error('Error searching content:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search content",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterByDate = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both start and end dates",
      })
      return
    }

    setIsLoading(true)
    try {
      let results = await filterActivityByDate(dateRange.from, dateRange.to)
      
      // Apply platform filter if active
      if (activeTab !== "all") {
        results = results.filter((item) => item.platforms && item.platforms.includes(activeTab))
      }

      setContentItems(results)
      setIsFiltered(true)
    } catch (error) {
      console.error('Error filtering content:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to filter content",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text || "Sample content text")
    setCopiedMap({ ...copiedMap, [id]: true })

    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    })

    setTimeout(() => {
      setCopiedMap({ ...copiedMap, [id]: false })
    }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsLoading(true)
    try {
      await deleteContentItem(itemToDelete)
    const updatedItems = contentItems.filter((item) => item.id !== itemToDelete)
    setContentItems(updatedItems)

    toast({
      title: "Item deleted",
      description: "The content item has been permanently deleted.",
    })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the content item",
      })
    } finally {
      setIsLoading(false)
    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
    }
  }

  const handleEdit = (item: any) => {
    setEditingContent(item)
    setEditedContent(item.content || "")
    setEditDialogOpen(true)
  }

  const saveEditedContent = async () => {
    if (!editingContent) return

    setIsLoading(true)
    try {
      const updatedItem = {
        ...editingContent,
        content: editedContent,
        updated_at: new Date().toISOString()
      }

      console.log('Saving edited content:', {
        id: updatedItem.id,
        title: updatedItem.title
      })

      const savedItem = await saveContentItem(updatedItem)
      
      const updatedItems = contentItems.map((item) =>
        item.id === editingContent.id ? { ...savedItem } : item
      )
      setContentItems(updatedItems)

      toast({
        title: "Content updated",
        description: "Your edited content has been saved.",
      })

      setEditDialogOpen(false)
      setEditingContent(null)
      setEditedContent("")
    } catch (error: any) {
      console.error('Error saving content:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save the edited content",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (platform: string) => {
    if (!selectedItem) return

    try {
      await shareContent(platform, selectedItem.content)
      
      toast({
        title: "Content shared",
        description: `Content has been shared to ${platform}.`,
      })
    } catch (error) {
    toast({
        title: "Error",
        description: `Failed to share content to ${platform}.`,
        variant: "destructive",
    })
    }

    setShareDialogOpen(false)
  }

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
  }

  const handleDownload = (item: any) => {
    try {
    const platformName = item.platform || "content"
    const fileName = `${platformName.toLowerCase().replace(/\s+/g, "-")}-content-${Date.now()}.txt`

    const element = document.createElement("a")
      const file = new Blob([item.content || ""], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Content downloaded",
      description: `Content has been downloaded as ${fileName}`,
    })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download the content.",
        variant: "destructive",
    })
    }
  }

  const filterItemsByPlatform = async (platform: string) => {
    setIsLoading(true)
    try {
      let activity = await getRecentActivity()

      // Apply date filter if active
      if (dateRange.from && dateRange.to) {
        activity = await filterActivityByDate(dateRange.from, dateRange.to)
      }

      // Apply platform filter if not "all"
      if (platform !== "all") {
        activity = activity.filter((item) => item.platforms && item.platforms.includes(platform))
      }

      // Apply search filter if active
      if (searchQuery.trim()) {
        activity = activity.filter((item) => 
          item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setContentItems(activity)
      setIsFiltered(platform !== "all" || !!searchQuery.trim() || !!(dateRange.from && dateRange.to))
    } catch (error) {
      console.error('Error filtering by platform:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to filter content by platform",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    await filterItemsByPlatform(value)
  }

  const clearFilters = async () => {
    setIsLoading(true)
    try {
      const activity = await getRecentActivity()
      setContentItems(activity)
      setActiveTab("all")
      setDateRange({ from: undefined, to: undefined })
      setSearchQuery("")
      setIsFiltered(false)
    } catch (error) {
      console.error('Error clearing filters:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear filters",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format timestamp to date string
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "Unknown date"
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId)
    if (platform && platform.icon) {
      const Icon = platform.icon
      return <Icon className="h-4 w-4" />
    }
    return null
  }

  // Add this helper function after formatDate function
  const getContentTitle = (item: any) => {
    if (item.title) return item.title;
    if (item.content) {
      // Get first 5 words of content
      const words = item.content.split(' ').slice(0, 5).join(' ');
      return words + (item.content.split(' ').length > 5 ? '...' : '');
    }
    return "Untitled Content";
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Content Library" />

      <div className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold">Content Library</h1>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search content..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Popover open={showFilterOptions} onOpenChange={setShowFilterOptions}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-10">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Date Range</h4>
                      <div className="flex flex-col gap-2">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range as any)}
                          numberOfMonths={1}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Platform</h4>
                      <Select value={activeTab} onValueChange={(value) => handleTabChange(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined })
                          setActiveTab("all")
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleFilterByDate()
                          setShowFilterOptions(false)
                        }}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={handleSearch} className="hidden sm:flex h-10">
                Search
              </Button>

              {isFiltered && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-10">
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}

              <Button onClick={() => router.push("/generator")} className="sm:w-auto w-full h-10">
                Create New
              </Button>
            </div>
          </div>

          {/* Platform Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
            <TabsList className="w-full overflow-x-auto flex items-center justify-start p-0 h-auto whitespace-nowrap">
              <TabsTrigger value="all" className="px-3 py-2 h-10">
                All Content
              </TabsTrigger>
              {platforms.map((platform) => (
                <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-1.5 px-3 py-2 h-10">
                  <platform.icon className="h-4 w-4" />
                  <span>{platform.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="p-4">
                    <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            {/* Title */}
                            <div className="h-5 bg-muted/80 rounded-md w-3/4 animate-pulse" />
                            {/* Date */}
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full bg-muted/80 animate-pulse" />
                              <div className="h-4 w-32 bg-muted/80 rounded-md animate-pulse" />
                            </div>
                          </div>
                          {/* Menu button */}
                          <div className="h-8 w-8 rounded-md bg-muted/80 animate-pulse" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="space-y-4">
                          {/* Platform badges */}
                          <div className="flex flex-wrap gap-2">
                            <div className="h-[22px] w-20 rounded-full bg-muted/80 animate-pulse" />
                            <div className="h-[22px] w-24 rounded-full bg-muted/80 animate-pulse" />
                            <div className="h-[22px] w-16 rounded-full bg-muted/80 animate-pulse" />
                          </div>
                          
                          {/* Content preview lines */}
                          <div className="space-y-2">
                            <div className="h-4 bg-muted/80 rounded w-full animate-pulse" />
                            <div className="h-4 bg-muted/80 rounded w-[85%] animate-pulse" />
                            <div className="h-4 bg-muted/80 rounded w-[70%] animate-pulse" />
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <div className="h-9 w-28 rounded-md bg-muted/80 animate-pulse" />
                            <div className="h-9 w-20 rounded-md bg-muted/80 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : contentItems.length > 0 ? (
              contentItems.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{getContentTitle(item)}</CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.timestamp ? formatDate(item.timestamp) : "Unknown date"}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(item.content, item.id)}>
                            <Copy className="h-4 w-4 mr-2" /> Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(item)}>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(item.platform)}>
                            <Share2 className="h-4 w-4 mr-2" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                            <ArrowUpRight className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(item.platforms || []).map((platform: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                            {getPlatformIcon(platform)}
                            <span>{platforms.find((p) => p.id === platform)?.name || platform}</span>
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm line-clamp-3 text-muted-foreground mb-3">
                        {item.content || "No content available"}
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <Card className="shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No content items yet</h3>
                      <p className="text-muted-foreground mb-4">Start generating content to see your library.</p>
                      <Button onClick={() => router.push("/generator")}>Generate Content</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{getContentTitle(selectedItem)}</DialogTitle>
              <DialogDescription>
                Generated on {selectedItem.timestamp ? formatDate(selectedItem.timestamp) : "Unknown date"}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                <div>
                  <h4 className="text-sm font-medium mb-1">Title</h4>
                  <p className="text-sm">{selectedItem.title || "Untitled Content"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Platforms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedItem.platforms || []).map((platform: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                        {getPlatformIcon(platform)}
                        <span>{platforms.find((p) => p.id === platform)?.name || platform}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Content</h4>
                  <div className="rounded-md border p-3 bg-muted/30 text-sm whitespace-pre-wrap">
                    {selectedItem.content || "No content available"}
                  </div>
                </div>
                {selectedItem.hashtags && selectedItem.hashtags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Hashtags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.hashtags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.lastModified && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Last Modified</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedItem.lastModified)}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCopy(selectedItem.content, selectedItem.id)
                    setSelectedItem(null)
                  }}
                >
                  Copy
                </Button>
                <Button
                  onClick={() => {
                    handleEdit(selectedItem)
                    setSelectedItem(null)
                  }}
                >
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Content Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Content</DialogTitle>
            <DialogDescription>Choose where you want to share this content</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-2 py-4">
              <Button variant="outline" onClick={() => handleShare("Twitter")} className="justify-start">
                Twitter/X
              </Button>
              <Button variant="outline" onClick={() => handleShare("LinkedIn")} className="justify-start">
                LinkedIn
              </Button>
              <Button variant="outline" onClick={() => handleShare("Facebook")} className="justify-start">
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleShare("Instagram")} className="justify-start">
                Instagram
              </Button>
              <Button variant="outline" onClick={() => handleShare("Email")} className="justify-start">
                Email
              </Button>
              <Button variant="outline" onClick={() => handleShare("Buffer")} className="justify-start">
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
    </div>
  )
}
