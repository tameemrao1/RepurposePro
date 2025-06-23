"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart2, FileText, Layers, Zap } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/top-bar"
import { getUsageStats, getRecentActivity } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [stats, setStats] = useState({
    blogsProcessed: 0,
    contentGenerated: 0,
    platformsUsed: [] as string[],
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/login')
          return
        }

        if (!session?.user) {
          console.log('No authenticated user')
          router.push('/login')
          return
        }

        // Add Authorization header for Supabase requests
        supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        })

        // Fetch user profile data with explicit headers
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Continue without profile data
          setUserData({ first_name: session.user.email?.split('@')[0] || 'User' })
        } else {
          setUserData(profile || { first_name: session.user.email?.split('@')[0] || 'User' })
        }

        // Get usage stats
        const usageStats = await getUsageStats()
        console.log('Initial usage stats:', usageStats)
        setStats({
          blogsProcessed: usageStats.blogsProcessed || 0,
          contentGenerated: usageStats.contentGenerated || 0,
          platformsUsed: usageStats.platformsUsed || [],
        })

        // Get recent activity
        const activity = await getRecentActivity()
        console.log('Initial recent activity:', activity)
        setRecentActivity(activity.slice(0, 5)) // Get only the 5 most recent items

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up real-time subscriptions
    const setupSubscriptions = async () => {
      console.log('Setting up real-time subscriptions...')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.log('No authenticated user for subscriptions')
        return
      }

      console.log('Creating content subscription for user:', session.user.id)
      const contentChannel = supabase
        .channel('content_updates')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events
            schema: 'public',
            table: 'user_content',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            console.log('Content change detected:', payload)
            // Refresh recent activity
            const activity = await getRecentActivity()
            console.log('Updated activity:', activity)
            setRecentActivity(activity.slice(0, 5))
          }
        )
        .subscribe((status) => {
          console.log('Content subscription status:', status)
        })

      console.log('Creating stats subscription for user:', session.user.id)
      const statsChannel = supabase
        .channel('stats_updates')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events
            schema: 'public',
            table: 'user_stats',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            console.log('Stats change detected:', payload)
            // Refresh stats
            const usageStats = await getUsageStats()
            console.log('Updated stats:', usageStats)
            setStats({
              blogsProcessed: usageStats.blogsProcessed || 0,
              contentGenerated: usageStats.contentGenerated || 0,
              platformsUsed: usageStats.platformsUsed || [],
            })
          }
        )
        .subscribe((status) => {
          console.log('Stats subscription status:', status)
        })

      return () => {
        console.log('Cleaning up subscriptions')
        contentChannel.unsubscribe()
        statsChannel.unsubscribe()
      }
    }

    fetchData()
    const cleanup = setupSubscriptions()

    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [supabase, router])

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const statCards = [
    {
      title: "Blog Posts Processed",
      value: stats.blogsProcessed.toString(),
      icon: FileText,
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-500",
    },
    {
      title: "Content Generated",
      value: stats.contentGenerated.toString(),
      icon: Layers,
      color: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-500",
    },
    {
      title: "Platforms Used",
      value: stats.platformsUsed.length.toString(),
      icon: BarChart2,
      color: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-500",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Dashboard" />

      <div className="flex-1 space-y-4 p-8 pt-6 w-full max-w-[100%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {getGreeting()}, {userData?.first_name || 'User'}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                What's on <span className="text-primary">your mind</span> today?
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                <Link href="/generator">
                  Start Repurposing <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : statCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <p className="text-3xl font-bold mt-1">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-full ${stat.color}`}>
                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest content repurposing activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div
                          key={activity.id || index}
                          className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="p-2 rounded-full bg-muted">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{activity.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {activity.platforms?.join(", ")}
                            </p>
                            {activity.content && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {activity.content}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {activity.created_at ? formatRelativeTime(activity.created_at) : "Recently"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-4">No recent activity. Start generating content!</p>
                        <Button asChild size="sm">
                          <Link href="/generator">Generate Content</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Ready to repurpose your next blog post?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Transform your content into platform-optimized formats in seconds.
                    </p>
                  </div>
                  <Button asChild className="w-full md:w-auto">
                    <Link href="/generator">Go to Generator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
