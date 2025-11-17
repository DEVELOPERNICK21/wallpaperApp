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
    prompt: 'Rephrase this message in a flirty, playful, and teasing way while keeping the same meaning:',
  },
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    description: 'Business-appropriate',
    prompt: 'Rephrase this message in a professional, business-appropriate tone while keeping the same meaning:',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    emoji: '😊',
    description: 'Warm and approachable',
    prompt: 'Rephrase this message in a friendly, warm, and approachable way while keeping the same meaning:',
  },
  {
    id: 'short',
    name: 'Short & Sweet',
    emoji: '✂️',
    description: 'Concise and to the point',
    prompt: 'Rephrase this message to be short, concise, and to the point while keeping the same meaning:',
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic',
    emoji: '😏',
    description: 'Witty and ironic',
    prompt: 'Rephrase this message in a sarcastic, witty, and ironic way while keeping the same meaning:',
  },
  {
    id: 'emotional',
    name: 'Emotional',
    emoji: '❤️',
    description: 'Heartfelt and expressive',
    prompt: 'Rephrase this message in an emotional, heartfelt, and expressive way while keeping the same meaning:',
  },
  {
    id: 'formal',
    name: 'Formal',
    emoji: '🎩',
    description: 'Polite and respectful',
    prompt: 'Rephrase this message in a formal, polite, and respectful tone while keeping the same meaning:',
  },
  {
    id: 'sexy',
    name: 'Sexy but Classy',
    emoji: '🔥',
    description: 'Alluring yet tasteful',
    prompt: 'Rephrase this message in a sexy but classy, alluring yet tasteful way while keeping the same meaning:',
  },
  {
    id: 'funny',
    name: 'Funny',
    emoji: '😂',
    description: 'Humorous and lighthearted',
    prompt: 'Rephrase this message in a funny, humorous, and lighthearted way while keeping the same meaning:',
  },
  {
    id: 'confident',
    name: 'Confident',
    emoji: '💪',
    description: 'Bold and assertive',
    prompt: 'Rephrase this message in a confident, bold, and assertive way while keeping the same meaning:',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💕',
    description: 'Sweet and loving',
    prompt: 'Rephrase this message in a romantic, sweet, and loving way while keeping the same meaning:',
  },
  {
    id: 'poetic',
    name: 'Poetic',
    emoji: '✨',
    description: 'Beautiful and lyrical',
    prompt: 'Rephrase this message in a poetic, beautiful, and lyrical way while keeping the same meaning:',
  },
  {
    id: 'casual',
    name: 'Casual',
    emoji: '👋',
    description: 'Relaxed and informal',
    prompt: 'Rephrase this message in a casual, relaxed, and informal way while keeping the same meaning:',
  },
];

class AIMessageService {
  // You can use OpenAI API, or any other AI service
  // For now, we'll use a simple implementation that can be connected to OpenAI
  private apiKey: string | null = null;
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  /**
   * Initialize the service with API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Rephrase a message in a specific style using AI
   */
  async rephraseMessage(
    message: string,
    style: MessageStyle
  ): Promise<string> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    const styleConfig = MESSAGE_STYLES.find(s => s.id === style);
    if (!styleConfig) {
      throw new Error(`Invalid style: ${style}`);
    }

    // If no API key is set, return a mock response for testing
    if (!this.apiKey) {
      console.warn('⚠️ No API key set. Using mock response.');
      return this.getMockRephrasedMessage(message, style);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API error: ${response.status}`
        );
      }

      const data = await response.json();
      const rephrasedMessage =
        data.choices?.[0]?.message?.content?.trim() || message;

      return rephrasedMessage;
    } catch (error: any) {
      console.error('Error rephrasing message:', error);
      // Fallback to mock response on error
      return this.getMockRephrasedMessage(message, style);
    }
  }

  /**
   * Mock rephrasing for testing (when API key is not set)
   */
  private getMockRephrasedMessage(
    message: string,
    style: MessageStyle
  ): string {
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

    return mockTransformations[style]?.(message) || message;
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

