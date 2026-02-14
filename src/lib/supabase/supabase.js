import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://qwgsntncexeinykynpby.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z3NudG5jZXhlaW55a3lucGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzY2NTMsImV4cCI6MjA4NjY1MjY1M30.mk6WyRo3zFUXYiNBU8NtNPbY-ah8kfx9A6d96N9-CxY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});