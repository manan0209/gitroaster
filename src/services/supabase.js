import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    console.log('Fetching Hall of Shame...')
    const { data, error } = await supabase
      .from('roasts')
      .select('*')
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching Hall of Shame:', error)
      throw error
    }
    
    console.log('Hall of Shame data:', data)
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
    console.log('Starting vote process for roastId:', roastId, 'fingerprint:', fingerprint)
    
    const { error: voteError } = await supabase
      .from('votes')
      .insert([{ roast_id: roastId, fingerprint }])
    
    if (voteError) {
      console.error('Error inserting vote:', voteError)
      
      // Check if it's a duplicate vote error
      if (voteError.code === '23505' || voteError.message.includes('duplicate')) {
        throw new Error('Already voted on this roast')
      }
      
      throw voteError
    }

    // Get the updated roast data
    const { data: updatedRoast, error: fetchError } = await supabase
      .from('roasts')
      .select('*')
      .eq('id', roastId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching updated roast:', fetchError)
      throw fetchError
    }

    console.log('Vote added successfully, updated roast:', updatedRoast)
    return updatedRoast
  },

  // Check if user has voted on a roast
  async hasVoted(roastId, fingerprint) {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('roast_id', roastId)
        .eq('fingerprint', fingerprint)
        .single()
      
      // If there's an error but it's just "no rows found", return false
      if (error && error.code === 'PGRST116') {
        return false
      }
      
      if (error) {
        console.error('Error checking vote status:', error)
        // Return false to allow voting if we can't check status
        return false
      }
      
      return !!data
    } catch (error) {
      console.error('Error in hasVoted check:', error)
      return false
    }
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
