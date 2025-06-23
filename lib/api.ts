import type { GenerationRequest, GeneratedItem } from "./types"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

// Function to generate content using the OpenRouter API
export async function generateContent(request: GenerationRequest): Promise<GeneratedItem[]> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      // Try to get error details from the response
      let errorMessage = "Failed to generate content"
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // If we can't parse the error JSON, use the status text
        errorMessage = `Error: ${response.status} ${response.statusText}`
      }

      console.error("API error:", errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data.results || !Array.isArray(data.results)) {
      console.error("Invalid response format:", data)
      throw new Error("Invalid response from server")
    }

    // Call the progress callback for each result
    if (request.onProgress) {
      data.results.forEach(() => request.onProgress())
    }

    return data.results
  } catch (error) {
    console.error("Error generating content:", error)
    throw error
  }
}

// Function to regenerate a specific piece of content
export async function regenerateContent(
  originalContent: string,
  platform: string,
  tone: string,
  language = "english",
): Promise<GeneratedItem> {
  try {
    const response = await fetch("/api/regenerate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalContent,
        platform,
        tone,
        language,
      }),
    })

    if (!response.ok) {
      let errorMessage = "Failed to regenerate content"
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`
      }

      console.error("API error:", errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data.result) {
      console.error("Invalid response format:", data)
      throw new Error("Invalid response from server")
    }

    return data.result
  } catch (error) {
    console.error("Error regenerating content:", error)
    throw error
  }
}

// Function to generate suggestions
export async function generateSuggestions(type: string, platform: string, content: string): Promise<string[]> {
  try {
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        platform,
        content,
      }),
    })

    if (!response.ok) {
      let errorMessage = "Failed to generate suggestions"
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`
      }

      console.error("API error:", errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      console.error("Invalid response format:", data)
      throw new Error("Invalid response from server")
    }

    return data.suggestions
  } catch (error) {
    console.error("Error generating suggestions:", error)
    throw error
  }
}

// Function to extract content from a URL
export async function extractContentFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch("/api/extract-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to extract content: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error("Error extracting content:", error)
    throw error
  }
}

// Function to track usage statistics
export async function trackUsage(data: {
  blogProcessed: boolean
  contentGenerated: number
  platformsUsed: string[]
}) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('No authenticated user')
    }

    const { data: currentStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (statsError && statsError.code !== 'PGRST116') throw statsError

    const updatedStats = {
      user_id: session.user.id,
      blogs_processed: (currentStats?.blogs_processed || 0) + (data.blogProcessed ? 1 : 0),
      content_generated: (currentStats?.content_generated || 0) + data.contentGenerated,
      platforms_used: Array.from(new Set([...(currentStats?.platforms_used || []), ...data.platformsUsed])),
      last_updated: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('user_stats')
      .upsert([updatedStats])

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error tracking usage:', error)
    throw error
  }
}

// Types for content items
interface ContentItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  platforms: string[];
  hashtags?: string[];
}

// Function to get recent activity
export async function getRecentActivity() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log('No authenticated user in getRecentActivity')
      return []
    }

    console.log('Fetching recent activity for user:', session.user.id)
    const { data, error } = await supabase
      .from('user_content')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recent activity:', error)
      throw error
    }
    
    console.log('Recent activity data:', data)
    return data || []
  } catch (error) {
    console.error('Error in getRecentActivity:', error)
    return []
  }
}

// Function to search activity
export async function searchActivity(query: string) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.user) {
      return []
    }

    const { data, error } = await supabase
      .from('user_content')
      .select('*')
      .eq('user_id', session.user.id)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching activity:', error)
    return []
  }
}

// Function to filter activity by date
export async function filterActivityByDate(from: Date, to: Date) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.user) {
      return []
    }

    const { data, error } = await supabase
      .from('user_content')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error filtering activity by date:', error)
    return []
  }
}

// Function to save content item
export async function saveContentItem(item: any) {
  const supabase = createClientComponentClient()
  
  try {
    // Get session with proper destructuring
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session found')
      throw new Error('Please log in to continue')
    }

    // Ensure we have a user ID
    if (!session.user?.id) {
      console.error('No user ID found in session')
      throw new Error('User ID not found')
    }

    const contentData = {
      ...item,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    }

    console.log('Saving content:', {
      id: contentData.id,
      user_id: contentData.user_id,
      title: contentData.title
    })

    if (item.id) {
      // Update existing item
      const { data, error } = await supabase
        .from('user_content')
        .update(contentData)
        .eq('id', item.id)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating content:', error)
        throw new Error(error.message)
      }

      console.log('Content updated successfully:', data)
      return data
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('user_content')
        .insert([{
          ...contentData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error inserting content:', error)
        throw new Error(error.message)
      }

      console.log('Content inserted successfully:', data)
      return data
    }
  } catch (error) {
    console.error('Error in saveContentItem:', error)
    throw error
  }
}

// Function to delete content item
export async function deleteContentItem(id: string) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('No authenticated user')
    }

    const { error } = await supabase
      .from('user_content')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting content item:', error)
    throw error
  }
}

// Share content (simulated)
export function shareContent(platform: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulate API call
    setTimeout(() => {
      console.log(`Shared to ${platform}: ${content}`);
      resolve(true);
    }, 1000);
  });
}

// Function to get usage statistics
export async function getUsageStats() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.log('No user session in getUsageStats')
    return {
        blogsProcessed: 0,
        contentGenerated: 0,
        platformsUsed: [],
        lastUpdated: null
      }
    }

    console.log('Fetching stats for user:', session.user?.id)
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user?.id)
      .single()

    if (error) {
      console.error('Error fetching stats:', error)
      if (error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    }

    console.log('Raw stats data:', data)

    // Map the database fields to the expected format
    const stats = {
      blogsProcessed: data?.blogs_processed || 0,
      contentGenerated: data?.content_generated || 0,
      platformsUsed: data?.platforms_used || [],
      lastUpdated: data?.last_updated || null
    }

    console.log('Mapped stats:', stats)
    return stats
  } catch (error) {
    console.error('Error in getUsageStats:', error)
    return {
      blogsProcessed: 0,
      contentGenerated: 0,
      platformsUsed: [],
      lastUpdated: null
    }
  }
}

// Function to add a notification
export async function addNotification(notification: {
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error"
}) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No authenticated user')
      return null
    }

    const newNotification = {
      user_id: session.user.id,
      title: notification.title,
      message: notification.message,
      type: notification.type || "info",
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_notifications')
      .insert([newNotification])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error adding notification:", error)
    return null
  }
}

// Function to get notifications
export async function getNotifications() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No authenticated user')
      return []
    }

    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

// Function to mark notification as read
export async function markNotificationAsRead(id: string) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No authenticated user')
      return
    }

    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

// Function to mark all notifications as read
export async function markAllNotificationsAsRead() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No authenticated user')
      return
    }

    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id)

    if (error) throw error
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
  }
}

// Function to delete notification
export async function deleteNotification(id: string) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No authenticated user')
      return
    }

    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting notification:", error)
  }
}

// Function to track activity and save generated content
export async function trackActivity(activity: {
  type: string
  title: string
  content: string
  platforms: string[]
  outputs?: number
  hashtags?: string[]
}) {
  const supabase = createClientComponentClient()
  
  try {
    // Check session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No authenticated user')
      throw new Error('Please log in to continue')
    }

    // Validate required fields
    if (!activity.title) throw new Error('Missing title')
    if (!activity.content) throw new Error('Missing content')
    if (!activity.platforms || activity.platforms.length === 0) throw new Error('Missing platforms')

    // Prepare content data
    const contentData = {
      user_id: session.user?.id,
      title: activity.title,
      content: activity.content,
      platforms: activity.platforms,
      hashtags: activity.hashtags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Saving content:', { ...contentData, content: contentData.content.substring(0, 100) + '...' })

    // Save content with detailed error handling
    const { data: savedContent, error: contentError } = await supabase
      .from('user_content')
      .insert([contentData])
      .select()
      .single()

    if (contentError) {
      console.error('Content error details:', {
        code: contentError.code,
        message: contentError.message,
        details: contentError.details,
        hint: contentError.hint
      })
      throw new Error(contentError.message || 'Failed to save content')
    }

    if (!savedContent) {
      throw new Error('No content was saved')
    }

    // Update stats with detailed error handling
    const { data: currentStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session.user?.id)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Stats error:', statsError)
      // Don't throw here, just log the error and continue
    }

    const updatedStats = {
      user_id: session.user?.id,
      blogs_processed: (currentStats?.blogs_processed || 0) + (activity.type === 'blog' ? 1 : 0),
      content_generated: (currentStats?.content_generated || 0) + 1, // Always increment by 1 for each piece of content
      platforms_used: Array.from(new Set([...(currentStats?.platforms_used || []), ...activity.platforms])),
      last_updated: new Date().toISOString()
    }

    console.log('Updating stats:', updatedStats)

    const { error: updateError } = await supabase
      .from('user_stats')
      .upsert([updatedStats])
      .select()

    if (updateError) {
      console.error('Update stats error:', updateError)
      // Don't throw here, just log the error
    }

    // Add notification
    addNotification({
      title: 'Content Generated',
      message: `Successfully generated content for ${activity.platforms.join(', ')}`,
      type: 'success'
    })

    return savedContent
  } catch (error) {
    console.error('Error tracking activity:', error)
    throw error
  }
}

