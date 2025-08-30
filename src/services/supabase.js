import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations
export const roastOperations = {
  // Save a new roast
  async saveRoast(username, roastText, roastType = 'profile', repoName = null, fingerprint) {
    const { data, error } = await supabase
      .from('roasts')
      .insert([
        {
          username,
          roast_text: roastText,
          roast_type: roastType,
          repo_name: repoName,
          fingerprint,
          votes: 0
        }
      ])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get Hall of Shame (top voted roasts)
  async getHallOfShame(limit = 10) {
    const { data, error } = await supabase
      .from('roasts')
      .select('*')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get roast of the day
  async getRoastOfTheDay() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_roasts')
      .select(`
        *,
        roasts (*)
      `)
      .eq('date', today)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.roasts || null
  },

  // Vote on a roast
  async voteRoast(roastId, fingerprint) {
    // Check if already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('roast_id', roastId)
      .eq('fingerprint', fingerprint)
      .single()
    
    if (existingVote) {
      throw new Error('Already voted on this roast')
    }

    // Add vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert([{ roast_id: roastId, fingerprint }])
    
    if (voteError) throw voteError

    // Increment vote count
    const { data, error } = await supabase
      .from('roasts')
      .update({ votes: supabase.sql`votes + 1` })
      .eq('id', roastId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Check if user has voted on a roast
  async hasVoted(roastId, fingerprint) {
    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('roast_id', roastId)
      .eq('fingerprint', fingerprint)
      .single()
    
    return !!data
  },

  // Get user's vote count for rate limiting
  async getUserVoteCount(fingerprint, hours = 1) {
    const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('fingerprint', fingerprint)
      .gte('created_at', timeAgo)
    
    return count || 0
  }
}
