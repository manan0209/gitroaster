# GitRoaster

A terminal-inspired web application that generates AI-powered roasts for GitHub profiles and repositories. Built with React and featuring a community voting system.

## Features

- Profile and repository roasting with AI analysis
- Real-time voting system with Hall of Shame leaderboard
- Mobile-responsive terminal UI
- Anonymous voting with browser fingerprinting
- Multi-dimensional project analysis (code quality and business concept)
- Expandable roast text in Hall of Shame


## Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

3. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from the project setup
   - Configure Row Level Security policies

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is optimized for deployment on Vercel:

1. Build the project: `npm run build`
2. Deploy to Vercel with environment variables configured
3. Ensure Supabase database is accessible from production

## Project Structure

- `src/App.jsx`: Main application with tabbed interface
- `src/components/`: React components (HallOfShame, VoteButton)
- `src/services/`: API integrations (AI, Supabase, GitHub)
- `src/App.css`: Terminal-inspired responsive styling

Built with modern web technologies for optimal performance and user experience.
