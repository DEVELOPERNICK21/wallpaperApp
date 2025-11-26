import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/types';
import SubscriptionService, {SubscriptionStatus} from '../services/SubscriptionService';

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.userDetails);
  const userId = user?.user?.uid;

  useEffect(() => {
    if (userId) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const checkSubscription = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const status = await SubscriptionService.checkSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriptionStatus,
    loading,
    isActive: subscriptionStatus?.isActive || false,
    refresh: checkSubscription,
  };
};

