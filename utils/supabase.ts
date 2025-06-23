import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upftaavsjqxseimspnuu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnRhYXZzanF4c2VpbXNwbnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTMyMTUsImV4cCI6MjA2MzY2OTIxNX0.fba_fdxFONlnOD-zhwV1vuy11ZmVtu3cIc8WeoYV88k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 