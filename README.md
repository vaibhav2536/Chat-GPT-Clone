# ChatGPT Clone

A pixel-perfect ChatGPT clone built with Next.js, Vercel AI SDK, and modern web technologies. This application replicates the ChatGPT interface with advanced features including chat memory, file uploads, message editing, and seamless AI integration.

## Features

### Core Functionality
- **Pixel-perfect UI**: Exact replica of ChatGPT's interface including layout, spacing, fonts, and animations
- **Real-time Chat**: Streaming responses using Vercel AI SDK with OpenAI integration
- **Chat Memory**: Persistent conversation history with local storage
- **Message Editing**: Edit and regenerate messages with seamless UI updates
- **File Upload Support**: Upload images, PDFs, documents, and text files
- **Mobile Responsive**: Fully responsive design with mobile-first approach
- **Accessibility**: ARIA-compliant with keyboard navigation support

### Advanced Features
- **Context Management**: Intelligent handling of long conversations with token limit management
- **Message Actions**: Copy, edit, regenerate, like/dislike, and share messages
- **Chat Management**: Create, delete, and organize multiple conversations
- **Search Functionality**: Search through chat history
- **Dark Theme**: Consistent dark theme matching ChatGPT's design
- **Typing Indicators**: Real-time typing animations during AI responses

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4
- **State Management**: Zustand with persistence
- **File Handling**: Next.js API routes with file upload support
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd chatgpt-clone
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your OpenAI API key to \`.env.local\`:
\`\`\`
OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── upload/        # File upload endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── chat-interface.tsx # Main chat interface
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── chat-area.tsx     # Chat messages area
│   ├── message-list.tsx  # Message list container
│   └── message.tsx       # Individual message component
├── lib/
│   ├── chat-store.ts     # Zustand store for chat state
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
└── public/               # Static assets
\`\`\`

## Key Components

### ChatInterface
Main container component that orchestrates the entire chat experience.

### Sidebar
Navigation panel with chat history, search functionality, and user profile.

### ChatArea
Main chat interface with message display and input handling.

### Message
Individual message component with editing, actions, and formatting.

### ChatStore
Zustand store managing chat state, persistence, and actions.

## API Endpoints

### POST /api/chat
Handles chat completions using Vercel AI SDK and OpenAI.

### POST /api/upload
Manages file uploads with support for multiple file types.

## Features Implementation

### Message Editing
- Click edit button on any user message
- Inline editing with save/cancel options
- Automatic chat regeneration after edits

### File Upload
- Drag and drop or click to upload
- Support for images, PDFs, documents
- File preview and management

### Chat Memory
- Persistent storage using Zustand persist middleware
- Automatic chat title generation
- Search and filter capabilities

### Context Management
- Token counting and management
- Intelligent message truncation for long conversations
- Context window optimization

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## Environment Variables

\`\`\`
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=your_app_url (optional)
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI for the GPT models
- Vercel for the AI SDK and hosting platform
- The React and Next.js communities
\`\`\`

## Support

For support and questions, please open an issue in the GitHub repository.
