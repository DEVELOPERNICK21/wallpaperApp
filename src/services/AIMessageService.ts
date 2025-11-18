/**
 * AI Message Rephrasing Service
 * Provides message rephrasing in different styles using AI
 */

export type MessageStyle =
  | 'flirty'
  | 'professional'
  | 'friendly'
  | 'short'
  | 'sarcastic'
  | 'emotional'
  | 'formal'
  | 'sexy'
  | 'funny'
  | 'confident'
  | 'romantic'
  | 'poetic'
  | 'casual';

export interface StyleConfig {
  id: MessageStyle;
  name: string;
  emoji: string;
  description: string;
  prompt: string;
}

export const MESSAGE_STYLES: StyleConfig[] = [
  {
    id: 'flirty',
    name: 'Flirty',
    emoji: '😘',
    description: 'Playful and teasing',
    prompt:
      'Rephrase this message in a flirty, playful, and teasing way while keeping the same meaning:',
  },
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    description: 'Business-appropriate',
    prompt:
      'Rephrase this message in a professional, business-appropriate tone while keeping the same meaning:',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    emoji: '😊',
    description: 'Warm and approachable',
    prompt:
      'Rephrase this message in a friendly, warm, and approachable way while keeping the same meaning:',
  },
  {
    id: 'short',
    name: 'Short & Sweet',
    emoji: '✂️',
    description: 'Concise and to the point',
    prompt:
      'Rephrase this message to be short, concise, and to the point while keeping the same meaning:',
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic',
    emoji: '😏',
    description: 'Witty and ironic',
    prompt:
      'Rephrase this message in a sarcastic, witty, and ironic way while keeping the same meaning:',
  },
  {
    id: 'emotional',
    name: 'Emotional',
    emoji: '❤️',
    description: 'Heartfelt and expressive',
    prompt:
      'Rephrase this message in an emotional, heartfelt, and expressive way while keeping the same meaning:',
  },
  {
    id: 'formal',
    name: 'Formal',
    emoji: '🎩',
    description: 'Polite and respectful',
    prompt:
      'Rephrase this message in a formal, polite, and respectful tone while keeping the same meaning:',
  },
  {
    id: 'sexy',
    name: 'Sexy but Classy',
    emoji: '🔥',
    description: 'Alluring yet tasteful',
    prompt:
      'Rephrase this message in a sexy but classy, alluring yet tasteful way while keeping the same meaning:',
  },
  {
    id: 'funny',
    name: 'Funny',
    emoji: '😂',
    description: 'Humorous and lighthearted',
    prompt:
      'Rephrase this message in a funny, humorous, and lighthearted way while keeping the same meaning:',
  },
  {
    id: 'confident',
    name: 'Confident',
    emoji: '💪',
    description: 'Bold and assertive',
    prompt:
      'Rephrase this message in a confident, bold, and assertive way while keeping the same meaning:',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💕',
    description: 'Sweet and loving',
    prompt:
      'Rephrase this message in a romantic, sweet, and loving way while keeping the same meaning:',
  },
  {
    id: 'poetic',
    name: 'Poetic',
    emoji: '✨',
    description: 'Beautiful and lyrical',
    prompt:
      'Rephrase this message in a poetic, beautiful, and lyrical way while keeping the same meaning:',
  },
  {
    id: 'casual',
    name: 'Casual',
    emoji: '👋',
    description: 'Relaxed and informal',
    prompt:
      'Rephrase this message in a casual, relaxed, and informal way while keeping the same meaning:',
  },
];

class AIMessageService {
  // Using OpenRouter API - a unified API for multiple AI models
  // Compatible with OpenAI format, but uses OpenRouter endpoint
  // Currently using FREE model: deepseek/deepseek-chat
  // Other free options: 'mistralai/mistral-7b-instruct', 'meta-llama/llama-3.1-8b-instruct'
  private apiKey: string | null =
    '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';
  private apiUrl: string = 'https://openrouter.ai/api/v1/chat/completions';

  /**
   * Initialize the service with API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Rephrase a message in a specific style using AI
   */
  async rephraseMessage(message: string, style: MessageStyle): Promise<string> {
    console.log('🤖 AI Rephrase Service Called');
    console.log('📝 Original Message:', message);
    console.log('🎨 Selected Style:', style);

    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    const styleConfig = MESSAGE_STYLES.find(s => s.id === style);
    if (!styleConfig) {
      throw new Error(`Invalid style: ${style}`);
    }

    console.log('✅ Style Config Found:', {
      name: styleConfig.name,
      description: styleConfig.description,
    });

    // If no API key is set, return a mock response for testing
    if (!this.apiKey) {
      console.warn('⚠️ WARNING: No API key set. Using mock response.');
      const mockResult = this.getMockRephrasedMessage(message, style);
      console.log('📤 Mock Result:', mockResult);
      return mockResult;
    }

    console.log('🔑 API Key Status: SET');
    console.log(
      '🔑 API Key (first 10 chars):',
      this.apiKey.substring(0, 10) + '...',
    );
    console.log('🌐 API URL:', this.apiUrl);

    const requestBody = {
      // Using DeepSeek Chat - a FREE model on OpenRouter
      // Other free options: 'mistralai/mistral-7b-instruct', 'meta-llama/llama-3.1-8b-instruct'
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that rephrases messages in different styles while maintaining the original meaning.',
        },
        {
          role: 'user',
          content: `${styleConfig.prompt}\n\n"${message}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));

    try {
      console.log('🚀 Sending API request to OpenRouter...');
      const startTime = Date.now();

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://wallpaperchat.app', // Optional: Your app URL
          'X-Title': 'Wallpaper Chat', // Optional: Your app name
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`⏱️ Request Duration: ${duration}ms`);
      console.log('📥 Response Status:', response.status, response.statusText);
      console.log(
        '📥 Response Headers:',
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        console.error('❌ Error Status:', response.status);
        const errorMessage = errorData.error?.message || 'Unknown error';
        console.error('❌ Error Message:', errorMessage);

        // Handle specific error cases
        if (response.status === 403) {
          if (errorMessage.includes('limit exceeded')) {
            throw new Error(
              'Monthly API limit exceeded. Please increase your credit limit in OpenRouter settings or wait for the monthly reset.',
            );
          }
          if (
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('invalid')
          ) {
            throw new Error(
              'Invalid API key. Please check your OpenRouter API key settings.',
            );
          }
        }

        if (response.status === 429) {
          throw new Error(
            'Rate limit exceeded. Please wait a moment and try again.',
          );
        }

        throw new Error(errorMessage || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response Data:', JSON.stringify(data, null, 2));

      const rephrasedMessage =
        data.choices?.[0]?.message?.content?.trim() || message;

      if (!rephrasedMessage || rephrasedMessage === message) {
        console.warn(
          '⚠️ WARNING: Empty or unchanged response from AI. Using original message.',
        );
        console.warn('⚠️ Response data:', data);
      } else {
        console.log('✨ AI Rephrased Message:', rephrasedMessage);
      }

      return rephrasedMessage;
    } catch (error: any) {
      console.error('❌ ERROR in rephraseMessage:');
      console.error('❌ Error Type:', error?.constructor?.name);
      console.error('❌ Error Message:', error?.message);
      console.error('❌ Error Stack:', error?.stack);
      console.error('❌ Full Error Object:', JSON.stringify(error, null, 2));

      // Try to get more details from fetch errors
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        console.error('❌ Network Error: Failed to connect to OpenRouter API');
        console.error(
          '❌ This could be a CORS issue, network issue, or URL is incorrect',
        );
      }

      // Check if it's a limit/credit error - don't fall back silently
      if (
        error?.message?.includes('limit exceeded') ||
        error?.message?.includes('credit')
      ) {
        console.error('⚠️ API Limit Error - Re-throwing to show user alert');
        // Re-throw so UI can show alert
        throw error;
      }

      console.warn('🔄 Falling back to mock response due to error');
      const mockResult = this.getMockRephrasedMessage(message, style);
      console.log('📤 Mock Result:', mockResult);
      return mockResult;
    }
  }

  /**
   * Mock rephrasing for testing (when API key is not set)
   */
  private getMockRephrasedMessage(
    message: string,
    style: MessageStyle,
  ): string {
    console.log('🎭 Using MOCK rephrasing (not AI-generated)');
    console.log('🎭 Mock Style:', style);
    console.log('🎭 Mock Original:', message);

    // Simple mock transformations for testing
    const mockTransformations: Record<MessageStyle, (msg: string) => string> = {
      flirty: msg => `Hey there 😉 ${msg.toLowerCase()}`,
      professional: msg => `I would like to discuss: ${msg}`,
      friendly: msg => `Hey! ${msg} 😊`,
      short: msg => msg.split(' ').slice(0, 5).join(' ') + '...',
      sarcastic: msg => `Oh sure, ${msg.toLowerCase()} 🙄`,
      emotional: msg => `I feel so strongly about this: ${msg} ❤️`,
      formal: msg => `I respectfully submit: ${msg}`,
      sexy: msg => `🔥 ${msg.toLowerCase()} 💋`,
      funny: msg => `😂 ${msg} 😂`,
      confident: msg => `I'm certain: ${msg.toUpperCase()}`,
      romantic: msg => `My dearest, ${msg} 💕`,
      poetic: msg => `In the realm of words, ${msg.toLowerCase()} ✨`,
      casual: msg => `Hey, ${msg.toLowerCase()}`,
    };

    const result = mockTransformations[style]?.(message) || message;
    console.log('🎭 Mock Result:', result);
    return result;
  }

  /**
   * Get all available styles
   */
  getAvailableStyles(): StyleConfig[] {
    return MESSAGE_STYLES;
  }

  /**
   * Get style config by ID
   */
  getStyleConfig(styleId: MessageStyle): StyleConfig | undefined {
    return MESSAGE_STYLES.find(s => s.id === styleId);
  }
}

export default new AIMessageService();
