import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qieyurcdmdbtbnqujaew.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZXl1cmNkbWRidGJucXVqYWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzUwNDEsImV4cCI6MjA5Nzk1MTA0MX0.zTmrX8bZ5-KnHgkDpVrncSsRo2qFqS1m686J0HSenBc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
