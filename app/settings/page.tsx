"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { addNotification } from "@/lib/api"
import { Clipboard, ClipboardCheck, RefreshCw, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface NotificationSettings {
  emailNotifications: boolean
  contentGenerationAlerts: boolean
  productUpdates: boolean
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClientComponentClient()

  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [darkMode, setDarkMode] = useState(false)
  const [defaultTone, setDefaultTone] = useState("professional")
  const [defaultOutputCount, setDefaultOutputCount] = useState("2")
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    contentGenerationAlerts: false,
    productUpdates: false
  })
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session?.user) {
          router.push('/login')
          return
        }

        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return
        }

        // Set form data with profile information
        setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || session.user.email || '',
        })

        // Fetch user preferences
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (!preferencesError && preferences) {
          setDefaultTone(preferences.default_tone || 'professional')
          setDefaultOutputCount(preferences.default_output_count?.toString() || '2')
          setNotificationSettings({
            emailNotifications: preferences.email_notifications || false,
            contentGenerationAlerts: preferences.content_generation_alerts || false,
            productUpdates: preferences.product_updates || false
          })
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Set active tab based on URL parameter
    if (tabParam && ["profile", "preferences", "notifications", "api"].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    // Check if dark mode is enabled
    if (theme === "dark") {
      setDarkMode(true)
    }

    fetchUserData()
  }, [tabParam, theme, supabase, router])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/settings?tab=${value}`, { scroll: false })
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session?.user) {
        router.push('/login')
        return
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })

      addNotification({
        title: "Profile Updated",
        message: "Your profile information has been updated successfully.",
        type: "success",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked)
    setTheme(checked ? "dark" : "light")

    toast({
      title: `${checked ? "Dark" : "Light"} mode enabled`,
      description: `Theme has been changed to ${checked ? "dark" : "light"} mode.`,
    })
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session?.user) {
        router.push('/login')
        return
      }

      // Update preferences in database
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          default_tone: defaultTone,
          default_output_count: parseInt(defaultOutputCount),
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save preferences",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session?.user) {
        router.push('/login')
        return
      }

      // Update notification settings in database
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          email_notifications: notificationSettings.emailNotifications,
          content_generation_alerts: notificationSettings.contentGenerationAlerts,
          product_updates: notificationSettings.productUpdates,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      toast({
        title: "Notification settings saved",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save notification settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyApiKey = () => {
    // In a real app, you would reveal and copy the actual API key
    navigator.clipboard.writeText("sk-actual-api-key-would-be-here")
    setIsCopied(true)

    toast({
      title: "API key copied",
      description: "API key has been copied to clipboard.",
    })

    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

  const handleRegenerateApiKey = async () => {
    setIsRegenerating(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (!session?.user) {
        router.push('/login')
        return
      }

      // Generate new API key (implement your API key generation logic)
      const newApiKey = 'sk-' + Math.random().toString(36).substring(2)

      // Update API key in database
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          api_key: newApiKey,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setApiKey("••••••••••••••••••••••••••••••")

      toast({
        title: "API key regenerated",
        description: "A new API key has been generated.",
      })

      addNotification({
        title: "API Key Regenerated",
        message: "Your API key has been regenerated. Make sure to update it in your applications.",
        type: "warning",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to regenerate API key",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleConnectIntegration = (integration: string) => {
    toast({
      title: `${integration} integration`,
      description: `${integration} integration is coming soon.`,
    })
  }

  return (
    <div className="flex flex-col h-full w-full">
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full px-4 sm:px-6 md:px-8 py-6"
        >
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-sm text-muted-foreground">
                            Email cannot be changed when using Google login.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your app preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-9 w-40" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-9 w-40" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Dark Mode</h4>
                            <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                          </div>
                          <Switch checked={darkMode} onCheckedChange={handleToggleDarkMode} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Default Tone</h4>
                            <p className="text-sm text-muted-foreground">Set your default content tone</p>
                          </div>
                          <Select value={defaultTone} onValueChange={setDefaultTone}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="witty">Witty</SelectItem>
                              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                              <SelectItem value="educational">Educational</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Default Output Count</h4>
                            <p className="text-sm text-muted-foreground">Number of outputs per platform</p>
                          </div>
                          <Select value={defaultOutputCount} onValueChange={setDefaultOutputCount}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select count" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSavePreferences} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Preferences"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {/* <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-muted-foreground">Receive email updates about your activity</p>
                          </div>
                          <Switch 
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                            }
                          />
                        </div> */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Content Generation Alerts</h4>
                            <p className="text-sm text-muted-foreground">
                              Get notified when content generation is complete
                            </p>
                          </div>
                          <Switch 
                            checked={notificationSettings.contentGenerationAlerts}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, contentGenerationAlerts: checked }))
                            }
                          />
                        </div>
                        {/* <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Product Updates</h4>
                            <p className="text-sm text-muted-foreground">
                              Receive updates about new features and improvements
                            </p>
                          </div>
                          <Switch 
                            checked={notificationSettings.productUpdates}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, productUpdates: checked }))
                            }
                          />
                        </div> */}
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSaveNotifications} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Notification Settings"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>Manage your API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-10 w-24" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="border rounded-lg divide-y">
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-40 mt-1" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                          </div>
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-3 w-36 mt-1" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key</Label>
                          <div className="flex flex-wrap gap-2">
                            <Input id="api-key" value={apiKey} readOnly className="font-mono flex-1" />
                            <Button
                              variant="outline"
                              onClick={handleCopyApiKey}
                              className="gap-2 min-w-[80px]"
                              disabled={isCopied}
                            >
                              {isCopied ? (
                                <>
                                  <ClipboardCheck className="h-4 w-4" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Clipboard className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleRegenerateApiKey}
                              className="gap-2 min-w-[110px]"
                              disabled={isRegenerating}
                            >
                              {isRegenerating ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Regenerating...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4" />
                                  Regenerate
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Last used: 2 days ago</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Integrations</h4>
                          <div className="border rounded-lg divide-y">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                              <div>
                                <h5 className="font-medium">WordPress</h5>
                                <p className="text-sm text-muted-foreground">Connect to your WordPress site</p>
                              </div>
                              <Button variant="outline" onClick={() => handleConnectIntegration("WordPress")}>
                                Connect
                              </Button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                              <div>
                                <h5 className="font-medium">Buffer</h5>
                                <p className="text-sm text-muted-foreground">Schedule posts to social media</p>
                              </div>
                              <Button variant="outline" onClick={() => handleConnectIntegration("Buffer")}>
                                Connect
                              </Button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                              <div>
                                <h5 className="font-medium">Zapier</h5>
                                <p className="text-sm text-muted-foreground">Automate your workflows</p>
                              </div>
                              <Button variant="outline" onClick={() => handleConnectIntegration("Zapier")}>
                                Connect
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
