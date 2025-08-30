# GitRoaster

A minimalistic web app with a retro terminal-inspired UI that brutally roasts your GitHub profile using a free AI API. Enter your GitHub username and get a savage roast based on your public activity!

## Features
- Retro, terminal-inspired UI
- Input your GitHub username
- Fetches public GitHub data
- Sends data to a free AI endpoint for a creative, brutal roast
- Share your roast on social media

## APIs Used
- **GitHub API**: Fetches public profile data (free, no auth required)
- **Hugging Face Inference API**: Generates AI roasts using Mixtral-8x7B model (free tier)

## Setup

1. Get a free Hugging Face token:
   - Go to [huggingface.co](https://huggingface.co)
   - Create an account and generate an API token
   - Create a `.env` file with: `VITE_HF_TOKEN=your_token_here`

2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Project Structure
- `src/App.jsx`: Main app logic and UI
- `src/App.css`: Styles for the retro terminal look

## Customization
- Replace the AI endpoint in the code if you want to use a different model or provider.

---

Built with [Vite](https://vitejs.dev/) + [React](https://react.dev/).
