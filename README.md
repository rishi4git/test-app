# AI Chat Assistant

A simple chat application that uses Google's Gemini API to provide AI-powered conversation functionality.

## Features

- Multi-turn conversation with context retention
- Clean and modern UI
- Secure API key storage in local browser storage
- Markdown-style formatting support in messages

## Setup Instructions

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Run the application server using Node.js
3. Enter your API key in the application
4. Start chatting with the AI assistant!

## Running the Application

### Using Node.js

Run the following command in the terminal:

```bash
node server.js
```

Then open your browser and go to http://localhost:3000

## Implementation Details

This application communicates with the Gemini API to generate responses based on the conversation history. The entire conversation context is maintained and sent with each new message to provide continuity in the interaction.

## Important Notes

- Your API key is stored locally in your browser and is not sent to any server other than Google's Gemini API service
- Make sure to keep your API key private
