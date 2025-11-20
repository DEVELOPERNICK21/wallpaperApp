import firestore from '@react-native-firebase/firestore';

export interface SubscriptionStatus {
  isActive: boolean;
  subscriptionType: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionId?: string;
  startDate?: Date;
  endDate?: Date;
  paymentProvider?: string; // 'razorpay' | 'stripe' | 'manual'
  paymentId?: string;
  isLifetime?: boolean;
}

class SubscriptionService {
  /**
   * Check if user has active subscription
   */
  async checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const userDoc = await firestore()
        .collection('Users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return {
          isActive: false,
          subscriptionType: 'free',
        };
      }

      const userData = userDoc.data();
      const subscription = userData?.subscription || {};

      // Check if subscription is active
      const now = new Date();
      const endDate = subscription.endDate?.toDate
        ? subscription.endDate.toDate()
        : subscription.endDate
        ? new Date(subscription.endDate)
        : null;

      const isActive =
        subscription.isActive === true &&
        (subscription.isLifetime === true ||
          (endDate && endDate > now) ||
          !endDate);

      return {
        isActive: isActive || false,
        subscriptionType: subscription.type || 'free',
        subscriptionId: subscription.subscriptionId,
        startDate: subscription.startDate?.toDate
          ? subscription.startDate.toDate()
          : subscription.startDate
          ? new Date(subscription.startDate)
          : undefined,
        endDate: endDate || undefined,
        paymentProvider: subscription.paymentProvider,
        paymentId: subscription.paymentId,
        isLifetime: subscription.isLifetime || false,
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return {
        isActive: false,
        subscriptionType: 'free',
      };
    }
  }

  /**
   * Update subscription status (called after successful payment)
   */
  async updateSubscriptionStatus(
    userId: string,
    subscriptionData: {
      type: 'basic' | 'premium' | 'enterprise';
      subscriptionId?: string;
      paymentProvider?: string;
      paymentId?: string;
      startDate?: Date;
      endDate?: Date;
      isLifetime?: boolean;
    },
  ): Promise<void> {
    try {
      const now = new Date();
      
      await firestore()
        .collection('Users')
        .doc(userId)
        .update({
          subscription: {
            isActive: true,
            type: subscriptionData.type,
            subscriptionId: subscriptionData.subscriptionId,
            paymentProvider: subscriptionData.paymentProvider,
            paymentId: subscriptionData.paymentId,
            startDate: subscriptionData.startDate || now,
            endDate: subscriptionData.endDate,
            isLifetime: subscriptionData.isLifetime || false,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          subscriptionUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ Subscription status updated successfully');
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      await firestore()
        .collection('Users')
        .doc(userId)
        .update({
          'subscription.isActive': false,
          subscriptionCancelledAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ Subscription cancelled');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription expiry date
   */
  async getSubscriptionExpiry(userId: string): Promise<Date | null> {
    try {
      const status = await this.checkSubscriptionStatus(userId);
      return status.endDate || null;
    } catch (error) {
      console.error('Error getting subscription expiry:', error);
      return null;
    }
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  async isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
    try {
      const status = await this.checkSubscriptionStatus(userId);
      if (!status.isActive || !status.endDate || status.isLifetime) {
        return false;
      }

      const daysUntilExpiry =
        (status.endDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24);

      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    } catch (error) {
      console.error('Error checking subscription expiry:', error);
      return false;
    }
  }
}

export default new SubscriptionService();

