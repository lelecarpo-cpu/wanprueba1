import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxvqyitjafhwtwntuhdb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnF5aXRqYWZod3R3bnR1aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDczMzAsImV4cCI6MjA4MDc4MzMzMH0.3-jnPLEt2HLUC8o25FLTdJzqd9ncnPViDesXRuAm1gk';

export const supabase = createClient(supabaseUrl, supabaseKey);