// Simple localStorage-based settings storage as fallback
// This provides immediate functionality while database can be set up later

interface UserProfile {
  firstName: string
  lastName: string
  email: string
}

interface UserPreferences {
  defaultTone: string
  defaultOutputCount: string
  darkMode: boolean
}

interface NotificationSettings {
  emailNotifications: boolean
  contentGenerationAlerts: boolean
  productUpdates: boolean
}

// Profile storage
export const profileStorage = {
  get(): UserProfile {
    if (typeof window === 'undefined') return { firstName: '', lastName: '', email: '' }
    
    const stored = localStorage.getItem('user_profile')
    return stored ? JSON.parse(stored) : { firstName: '', lastName: '', email: '' }
  },
  
  set(profile: UserProfile) {
    if (typeof window === 'undefined') return
    localStorage.setItem('user_profile', JSON.stringify(profile))
  }
}

// Preferences storage
export const preferencesStorage = {
  get(): UserPreferences {
    if (typeof window === 'undefined') return { defaultTone: 'professional', defaultOutputCount: '2', darkMode: false }
    
    const stored = localStorage.getItem('user_preferences')
    return stored ? JSON.parse(stored) : { defaultTone: 'professional', defaultOutputCount: '2', darkMode: false }
  },
  
  set(preferences: UserPreferences) {
    if (typeof window === 'undefined') return
    localStorage.setItem('user_preferences', JSON.stringify(preferences))
  }
}

// Notifications storage
export const notificationsStorage = {
  get(): NotificationSettings {
    if (typeof window === 'undefined') return { emailNotifications: false, contentGenerationAlerts: true, productUpdates: false }
    
    const stored = localStorage.getItem('notification_settings')
    return stored ? JSON.parse(stored) : { emailNotifications: false, contentGenerationAlerts: true, productUpdates: false }
  },
  
  set(settings: NotificationSettings) {
    if (typeof window === 'undefined') return
    localStorage.setItem('notification_settings', JSON.stringify(settings))
  }
}

// API Key storage
export const apiKeyStorage = {
  get(): string {
    if (typeof window === 'undefined') return 'sk-••••••••••••••••••••••••••••••'
    
    const stored = localStorage.getItem('user_api_key')
    return stored || 'sk-••••••••••••••••••••••••••••••'
  },
  
  set(apiKey: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem('user_api_key', apiKey)
  },
  
  generate(): string {
    const newKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    this.set(newKey)
    return newKey
  }
}