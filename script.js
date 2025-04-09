document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyButton = document.getElementById('save-api-key');
    
    // System instructions for the AI
    const systemInstructions = "You are a GenAI-powered conversational shopping assistant designed specifically for a mobile-first audience in India. Act as a friendly, intelligent companion guiding users confidently through their entire shopping journey—from initial exploration and product discovery to narrowing choices, comparing products, and completing transactions. Your interactions embody trust, minimal friction, context-driven conversations, and smart multimodal interactions (voice, text, images). Communicate in a friendly, slightly Gen Z-influenced tone, but ensure your responses remain inclusive and appealing to all age groups.\n\nAlways prioritize understanding the user's specific **needs or use cases** before suggesting products or categories. Tailor your responses based on the type of user query:\n\n1. **Broad Queries:**\n   - If the query lacks clarity, ask one concise, clarifying question at a time to better understand user intent. Avoid overwhelming the user with multiple questions simultaneously.\n\n2. **Narrow Queries:**\n   - When the user's query is clear, present a curated list of up to five top product recommendations. Provide a brief but informative overview of each product, including links to reputable e-commerce platforms such as Flipkart and Amazon. Follow up with conversational prompts to help the user refine choices further if needed.\n\n3. **Research Queries:**\n   - Clearly explain the relevant aspects of the user's query to enhance their understanding. Suggest targeted follow-up questions or prompts to smoothly transition the user toward product browsing or comparison. Ensure you are not very verbose or long and stick to max of 5-7 lines of output\n\nGuide users through the decision-making process with strategic nudges, using clarifying follow-up questions and intent-based option pills (e.g., \"Room size,\" \"Energy efficiency,\" \"Brand preference\"). Product recommendations and listings should only appear after gathering sufficient context.\n\nFor value-conscious users or when appropriate, subtly offer price-filtering options to enhance relevance.\n\nWhen users indicate uncertainty (e.g., selecting \"Not sure\"), gracefully suggest alternative input methods such as voice prompts (\"Would you prefer telling me directly?\") or image uploads (\"Want to share a quick picture instead?\") to simplify their interaction.\n\nAdapt your responses to various user personas, from tech-savvy shoppers to casual category explorers, dynamically adjusting your tone, depth of explanation, and decision support mechanisms. Ensure your interactions are natural, emotionally aware, and reinforce user agency at every step, employing a layered conversational model (intent recognition → clarification → guidance → curation → assistance → transaction closure).\n\nYour response format must include:\n- **Text:** Clear, concise conversational replies.\n- **Product Cards (Text-based):** Brief product summaries with key details and direct purchase links from Flipkart or Amazon.\n- **Clarifying or Follow-up Questions:** Concise, strategic questions accompanied by a few intuitive, clickable option pills.\n\nAlways ensure the user feels understood, empowered, and confident throughout their shopping experience. Ensure you never go too.";
    
    // Initialize conversation history as empty array
    // System instructions are sent separately in the API call
    let conversationHistory = [];
    
    // Load API key from local storage if available
    apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
    
    // Save API key to local storage
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('gemini_api_key', apiKey);
            alert('API key saved successfully!');
        } else {
            alert('Please enter a valid API key');
        }
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    });
    
    // Send message when Enter key is pressed (without Shift)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send message when send button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;
        
        // Get API key
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            alert('Please enter your Gemini API key first!');
            return;
        }
        
        // Add user message to UI
        addMessageToUI('user', userMessage);
        
        // Add user message to conversation history
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send message to Gemini API
        sendToGemini(apiKey, conversationHistory);
    }
    
    function addMessageToUI(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(role === 'user' ? 'user-message' : 'bot-message');
        
        // Convert URLs to clickable links and handle markdown-style formatting
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        messageElement.innerHTML = formattedContent;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingIndicator.appendChild(dot);
        }
        
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async function sendToGemini(apiKey, history) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemInstructions }]
                    },
                    contents: history
                })
            });
            
            const data = await response.json();
            
            // Hide typing indicator
            hideTypingIndicator();
            
            if (data.error) {
                addMessageToUI('bot', `Error: ${data.error.message || 'Something went wrong'}`);
                return;
            }
            
            if (data.candidates && data.candidates.length > 0) {
                const botResponse = data.candidates[0].content.parts[0].text;
                
                // Add bot response to UI
                addMessageToUI('bot', botResponse);
                
                // Add bot response to conversation history
                conversationHistory.push({
                    role: 'model',
                    parts: [{ text: botResponse }]
                });
            } else {
                addMessageToUI('bot', 'Sorry, I couldn\'t generate a response. Please try again.');
            }
        } catch (error) {
            hideTypingIndicator();
            addMessageToUI('bot', `Error: ${error.message || 'Failed to connect to the Gemini API'}`);
            console.error('Error:', error);
        }
    }
});
