# AI Message Rephrasing Implementation Guide

This guide explains how the AI message rephrasing feature works in your Wallpaper Chat app, so you can understand it for future use and extension.

## Overview

The AI Message Service (`AIMessageService.ts`) allows users to rephrase their messages in different styles (professional, flirty, funny, etc.) using OpenAI's GPT-3.5-turbo API. It's designed to be:

- **Easy to integrate**: Single service class you can import anywhere
- **Fallback-safe**: Works even without an API key (uses mock responses)
- **Extensible**: Easy to add new styles or switch AI providers
- **Error-resilient**: Falls back to mock responses on API errors

---

## Architecture

### 1. **Service Class Pattern**

The AI service uses a **Singleton pattern** - one shared instance used throughout the app:

```typescript
// Single instance exported
export default new AIMessageService();
```

**Why?** 
- Ensures API key is set once
- Avoids creating multiple service instances
- Provides a consistent interface across the app

### 2. **Type Safety with TypeScript**

The service uses TypeScript types to ensure type safety:

```typescript
export type MessageStyle = 
  | 'flirty' 
  | 'professional' 
  | 'friendly'
  // ... etc

export interface StyleConfig {
  id: MessageStyle;
  name: string;
  emoji: string;
  description: string;
  prompt: string;  // The prompt sent to AI
}
```

**Why?**
- Prevents typos in style names
- Autocomplete in your IDE
- Compile-time error checking

### 3. **Style Configuration**

Styles are defined in an array (`MESSAGE_STYLES`):

```typescript
{
  id: 'professional',
  name: 'Professional',
  emoji: '💼',
  description: 'Business-appropriate',
  prompt: 'Rephrase this message in a professional, business-appropriate tone...'
}
```

**Why store prompts?**
- Each style needs a different instruction for the AI
- Easy to add/edit styles without changing code logic
- Centralized configuration

---

## How It Works (Step-by-Step)

### Step 1: Initialize the Service

First, set your OpenAI API key (usually done once at app startup):

```typescript
import AIMessageService from './services/AIMessageService';

// In your app initialization
AIMessageService.setApiKey('sk-your-openai-api-key-here');
```

**Where should you do this?**
- In `App.tsx` on app start
- After user authentication
- From environment variables or secure storage

### Step 2: User Selects a Style

In your chat screen, user taps a style button (e.g., "Professional 💼"):

```javascript
const handleStyleSelect = async (style) => {
  // style = 'professional'
  const rephrased = await AIMessageService.rephraseMessage(
    currentMessage, 
    style
  );
};
```

### Step 3: Service Checks for API Key

```typescript
if (!this.apiKey) {
  // Use mock response (for testing/development)
  return this.getMockRephrasedMessage(message, style);
}
```

**Fallback behavior:**
- If no API key → uses mock transformations
- If API fails → falls back to mock
- Ensures app always works, even without internet/API

### Step 4: Build the API Request

The service constructs an OpenAI API request:

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',  // Which AI model to use
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that rephrases messages...'
      },
      {
        role: 'user',
        content: `${styleConfig.prompt}\n\n"${message}"`
        // Example: "Rephrase this in a professional tone: 'Hey, can we meet?'"
      }
    ],
    max_tokens: 200,      // Limit response length
    temperature: 0.7,     // Creativity level (0-1)
  })
});
```

**Key parameters explained:**

- **`model`**: Which AI model to use (`gpt-3.5-turbo` is cheaper/faster than `gpt-4`)
- **`max_tokens`**: Maximum length of AI response (200 tokens ≈ 150 words)
- **`temperature`**: 
  - 0.0 = very consistent/deterministic
  - 0.7 = balanced creativity
  - 1.0 = very creative/variable

### Step 5: Parse AI Response

```typescript
const data = await response.json();
const rephrasedMessage = data.choices?.[0]?.message?.content?.trim();
```

OpenAI returns:
```json
{
  "choices": [
    {
      "message": {
        "content": "I would like to schedule a meeting with you."
      }
    }
  ]
}
```

We extract the first choice's content.

### Step 6: Handle Errors

```typescript
catch (error) {
  console.error('Error rephrasing message:', error);
  // Fallback to mock
  return this.getMockRephrasedMessage(message, style);
}
```

**Why fallback?**
- Network failures → app still works
- API errors → user gets something instead of nothing
- Rate limits → graceful degradation

---

## Integration in Chat Screen

Here's how it's used in your `ChatScreen.js`:

```javascript
// 1. Import the service
import AIMessageService, {MESSAGE_STYLES} from '../../services/AIMessageService';

// 2. Handler function
const handleRephrase = async () => {
  if (!messageText.trim()) return;
  
  setIsRephrasing(true);  // Show loading state
  
  try {
    // 3. Call the AI service
    const rephrasedMessage = await AIMessageService.rephraseMessage(
      messageText,    // Original message
      selectedStyle   // Style chosen by user
    );
    
    // 4. Update the input field with rephrased message
    setMessageText(rephrasedMessage);
  } catch (error) {
    // 5. Show error to user
    Alert.alert('Rephrasing Failed', error.message);
  } finally {
    setIsRephrasing(false);  // Hide loading state
  }
};
```

---

## How to Set Up

### 1. Get an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up/login
3. Create a new API key
4. **Copy it immediately** (you can't see it again)

### 2. Store the API Key Securely

**Option A: Environment Variables (Recommended for React Native)**

Create `.env` file:
```
OPENAI_API_KEY=sk-your-key-here
```

Then load it:
```javascript
import AIMessageService from './services/AIMessageService';
import Config from 'react-native-config';

// In App.tsx or where you initialize services
AIMessageService.setApiKey(Config.OPENAI_API_KEY);
```

**Option B: Secure Storage**

For production apps, store in secure storage:
```javascript
import * as Keychain from 'react-native-keychain';

const apiKey = await Keychain.getInternetCredentials('openai');
AIMessageService.setApiKey(apiKey.password);
```

**Option C: Backend Proxy (Most Secure)**

Don't store API key in app. Instead:
1. Create a backend endpoint: `POST /api/rephrase`
2. Backend calls OpenAI with your key
3. App calls your backend

This prevents API key theft from reverse-engineering your app.

### 3. Handle API Costs

OpenAI charges per token used:
- Input: ~$0.001 per 1K tokens
- Output: ~$0.002 per 1K tokens

**Example cost:**
- Message: 20 words = ~30 tokens
- Request: ~50 tokens total
- Cost per rephrase: ~$0.0001 (1/10,000th of a dollar)

**Cost optimization:**
- Set `max_tokens: 200` (already done)
- Use `gpt-3.5-turbo` (cheaper than GPT-4)
- Add rate limiting (e.g., 10 rephrases per user per day)
- Cache common rephrases

---

## How to Extend

### Adding a New Style

1. Add to `MessageStyle` type:
```typescript
export type MessageStyle =
  | 'flirty'
  | 'professional'
  // ... existing styles
  | 'dramatic';  // Add new style
```

2. Add to `MESSAGE_STYLES` array:
```typescript
{
  id: 'dramatic',
  name: 'Dramatic',
  emoji: '🎭',
  description: 'Theatrical and expressive',
  prompt: 'Rephrase this message in a dramatic, theatrical, and expressive way while keeping the same meaning:',
}
```

3. Add mock transformation:
```typescript
dramatic: msg => `🎭 *dramatically* ${msg.toUpperCase()} 🎭`,
```

That's it! The UI will automatically show the new style.

### Switching AI Providers

To use a different AI service (e.g., Anthropic Claude, Google Gemini):

1. Update the `apiUrl`:
```typescript
private apiUrl: string = 'https://api.anthropic.com/v1/messages';
```

2. Update the request format:
```typescript
body: JSON.stringify({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 200,
  messages: [
    {
      role: 'user',
      content: `${styleConfig.prompt}\n\n"${message}"`
    }
  ]
})
```

3. Update response parsing:
```typescript
const rephrasedMessage = data.content[0].text;
```

### Adding Rate Limiting

Add rate limiting to prevent API abuse:

```typescript
private lastRequestTime: number = 0;
private requestCount: number = 0;
private readonly RATE_LIMIT_MS = 1000; // 1 request per second
private readonly MAX_REQUESTS_PER_MINUTE = 60;

async rephraseMessage(message: string, style: MessageStyle): Promise<string> {
  const now = Date.now();
  
  // Rate limiting
  if (now - this.lastRequestTime < this.RATE_LIMIT_MS) {
    throw new Error('Please wait before rephrasing again');
  }
  
  if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  this.lastRequestTime = now;
  this.requestCount++;
  
  // ... rest of the code
}
```

### Adding Caching

Cache responses to save API costs:

```typescript
private cache: Map<string, string> = new Map();

async rephraseMessage(message: string, style: MessageStyle): Promise<string> {
  // Create cache key
  const cacheKey = `${message}:${style}`;
  
  // Check cache
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey)!;
  }
  
  // Call API
  const rephrased = await this.callOpenAI(message, style);
  
  // Store in cache
  this.cache.set(cacheKey, rephrased);
  
  return rephrased;
}
```

---

## Best Practices

### 1. **Always Handle Errors**
```javascript
try {
  const result = await AIMessageService.rephraseMessage(text, style);
} catch (error) {
  // Show user-friendly error
  Alert.alert('Oops', 'Could not rephrase message. Please try again.');
}
```

### 2. **Show Loading States**
```javascript
const [isRephrasing, setIsRephrasing] = useState(false);

// In your UI
{isRephrasing ? (
  <ActivityIndicator />
) : (
  <Button onPress={handleRephrase}>Rephrase</Button>
)}
```

### 3. **Validate Input**
The service already validates empty messages, but you can add more:
```javascript
if (messageText.length > 500) {
  Alert.alert('Message too long', 'Please keep messages under 500 characters.');
  return;
}
```

### 4. **Don't Store API Key in Code**
Never commit API keys to Git. Use environment variables or secure storage.

### 5. **Monitor API Usage**
Set up alerts in OpenAI dashboard to track costs and usage patterns.

---

## Testing Without API Key

The service automatically uses mock responses when no API key is set:

```typescript
// Without API key
const result = await AIMessageService.rephraseMessage('Hello', 'professional');
// Returns: "I would like to discuss: Hello"

// With API key - gets real AI response
AIMessageService.setApiKey('sk-...');
const result = await AIMessageService.rephraseMessage('Hello', 'professional');
// Returns: "I would like to discuss this matter with you."
```

**Useful for:**
- Development without API costs
- Testing UI flow
- Offline development

---

## Troubleshooting

### "No API key set" warning
- Set the API key: `AIMessageService.setApiKey('your-key')`
- Check the key is loaded from environment variables

### API errors (401, 403, 429)
- **401**: Invalid API key
- **403**: API key doesn't have permission
- **429**: Rate limit exceeded (too many requests)

### Slow responses
- Network issue
- OpenAI API is slow
- Consider adding timeout:
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

const response = await fetch(this.apiUrl, {
  ...options,
  signal: controller.signal
});
```

---

## Summary

The AI implementation follows a clean, extensible pattern:

1. **Service class** handles all AI logic
2. **TypeScript types** ensure type safety
3. **Style configuration** makes it easy to add styles
4. **Fallback system** ensures app always works
5. **Error handling** provides graceful degradation

Key files:
- `src/services/AIMessageService.ts` - The AI service
- `src/screens/ChatScreen/ChatScreen.js` - Where it's used

To use it:
1. Set API key once: `AIMessageService.setApiKey(key)`
2. Call rephrase: `await AIMessageService.rephraseMessage(text, style)`
3. Handle result: Update your UI with the rephrased message

To extend it:
1. Add new styles to `MESSAGE_STYLES` array
2. Update `MessageStyle` type
3. Add mock transformation for fallback

This pattern can be reused for other AI features (summarization, translation, sentiment analysis, etc.)!
