import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

interface DailyUsage {
  date: string; // YYYY-MM-DD format
  messagesSent: number;
  chatsAccessed: number;
  appOpens: number;
  lastUpdated: number; // timestamp
}

class UsageTracker {
  private readonly STORAGE_KEY = 'daily_usage';
  private readonly USER_USAGE_COLLECTION = 'userUsage';

  /**
   * Track app open
   */
  async trackAppOpen(userId: string): Promise<void> {
    try {
      const today = this.getTodayDate();
      const usage = await this.getTodayUsage(userId);
      
      usage.appOpens += 1;
      usage.lastUpdated = Date.now();
      
      await this.saveTodayUsage(userId, usage);
    } catch (error) {
      console.error('Error tracking app open:', error);
    }
  }

  /**
   * Track message sent
   */
  async trackMessageSent(userId: string): Promise<void> {
    try {
      const today = this.getTodayDate();
      const usage = await this.getTodayUsage(userId);
      
      usage.messagesSent += 1;
      usage.lastUpdated = Date.now();
      
      await this.saveTodayUsage(userId, usage);
    } catch (error) {
      console.error('Error tracking message sent:', error);
    }
  }

  /**
   * Track chat accessed
   */
  async trackChatAccessed(userId: string): Promise<void> {
    try {
      const today = this.getTodayDate();
      const usage = await this.getTodayUsage(userId);
      
      usage.chatsAccessed += 1;
      usage.lastUpdated = Date.now();
      
      await this.saveTodayUsage(userId, usage);
    } catch (error) {
      console.error('Error tracking chat accessed:', error);
    }
  }

  /**
   * Get today's usage
   */
  async getTodayUsage(userId: string): Promise<DailyUsage> {
    try {
      const today = this.getTodayDate();
      
      // Try to get from Firestore first
      const usageDoc = await firestore()
        .collection(this.USER_USAGE_COLLECTION)
        .doc(userId)
        .collection('daily')
        .doc(today)
        .get();

      if (usageDoc.exists) {
        const data = usageDoc.data();
        return {
          date: today,
          messagesSent: data?.messagesSent || 0,
          chatsAccessed: data?.chatsAccessed || 0,
          appOpens: data?.appOpens || 0,
          lastUpdated: data?.lastUpdated || Date.now(),
        };
      }

      // Fallback to local storage
      const localUsage = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${userId}_${today}`);
      if (localUsage) {
        return JSON.parse(localUsage);
      }

      // Return default
      return {
        date: today,
        messagesSent: 0,
        chatsAccessed: 0,
        appOpens: 0,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Error getting today usage:', error);
      return {
        date: this.getTodayDate(),
        messagesSent: 0,
        chatsAccessed: 0,
        appOpens: 0,
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Get usage for last N days
   */
  async getUsageHistory(userId: string, days: number = 7): Promise<DailyUsage[]> {
    try {
      const history: DailyUsage[] = [];
      const today = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = this.formatDate(date);

        const usage = await this.getUsageForDate(userId, dateStr);
        history.push(usage);
      }

      return history.reverse(); // Oldest first
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }

  /**
   * Get usage for a specific date
   */
  private async getUsageForDate(userId: string, date: string): Promise<DailyUsage> {
    try {
      const usageDoc = await firestore()
        .collection(this.USER_USAGE_COLLECTION)
        .doc(userId)
        .collection('daily')
        .doc(date)
        .get();

      if (usageDoc.exists) {
        const data = usageDoc.data();
        return {
          date,
          messagesSent: data?.messagesSent || 0,
          chatsAccessed: data?.chatsAccessed || 0,
          appOpens: data?.appOpens || 0,
          lastUpdated: data?.lastUpdated || Date.now(),
        };
      }

      return {
        date,
        messagesSent: 0,
        chatsAccessed: 0,
        appOpens: 0,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Error getting usage for date:', error);
      return {
        date,
        messagesSent: 0,
        chatsAccessed: 0,
        appOpens: 0,
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Save today's usage
   */
  private async saveTodayUsage(userId: string, usage: DailyUsage): Promise<void> {
    try {
      const today = this.getTodayDate();

      // Save to Firestore
      await firestore()
        .collection(this.USER_USAGE_COLLECTION)
        .doc(userId)
        .collection('daily')
        .doc(today)
        .set({
          ...usage,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, {merge: true});

      // Also save locally as backup
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userId}_${today}`,
        JSON.stringify(usage),
      );
    } catch (error) {
      console.error('Error saving today usage:', error);
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get total usage for current month
   */
  async getMonthlyUsage(userId: string): Promise<{
    messagesSent: number;
    chatsAccessed: number;
    appOpens: number;
  }> {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const usageSnapshot = await firestore()
        .collection(this.USER_USAGE_COLLECTION)
        .doc(userId)
        .collection('daily')
        .where('date', '>=', this.formatDate(firstDayOfMonth))
        .where('date', '<=', this.formatDate(lastDayOfMonth))
        .get();

      let totalMessages = 0;
      let totalChats = 0;
      let totalOpens = 0;

      usageSnapshot.forEach(doc => {
        const data = doc.data();
        totalMessages += data?.messagesSent || 0;
        totalChats += data?.chatsAccessed || 0;
        totalOpens += data?.appOpens || 0;
      });

      return {
        messagesSent: totalMessages,
        chatsAccessed: totalChats,
        appOpens: totalOpens,
      };
    } catch (error) {
      console.error('Error getting monthly usage:', error);
      return {
        messagesSent: 0,
        chatsAccessed: 0,
        appOpens: 0,
      };
    }
  }
}

export default new UsageTracker();

