import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gclhfptjlerdyfiajfsz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbGhmcHRqbGVyZHlmaWFqZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDk1MzcsImV4cCI6MjA2ODEyNTUzN30.FVownn37G7Pd9SIVFozTZGqw8hpyX182FkvAW9v3yBw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
