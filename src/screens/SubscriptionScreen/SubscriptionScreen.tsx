import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers';
import SubscriptionService, {SubscriptionStatus} from '../../services/SubscriptionService';
import firestore from '@react-native-firebase/firestore';

const SubscriptionScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const user = useSelector((state: RootState) => state.userDetails);
  const userId = user?.user?.uid;

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const status = await SubscriptionService.checkSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
      Alert.alert('Error', 'Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    // Open landing page subscription URL
    const subscriptionUrl = 'https://your-domain.com/subscribe'; // Update with your actual URL
    Linking.openURL(subscriptionUrl).catch(err =>
      console.error('Error opening subscription URL:', err),
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading subscription status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>Manage your subscription plan</Text>
        </View>

        {subscriptionStatus?.isActive ? (
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={styles.statusText}>✓ Active</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={styles.infoValue}>
                {subscriptionStatus.subscriptionType.toUpperCase()}
              </Text>
            </View>

            {subscriptionStatus.endDate && !subscriptionStatus.isLifetime && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Expires On</Text>
                <Text style={styles.infoValue}>
                  {formatDate(subscriptionStatus.endDate)}
                </Text>
              </View>
            )}

            {subscriptionStatus.isLifetime && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Plan Type</Text>
                <Text style={styles.infoValue}>Lifetime Access</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.8}>
              <Text style={styles.subscribeButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, styles.inactiveBadge]}>
              <Text style={styles.statusText}>✗ Inactive</Text>
            </View>

            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>Subscription Required</Text>
              <Text style={styles.warningText}>
                You need an active subscription to use this app. Please subscribe to continue.
              </Text>
            </View>

            <View style={styles.plansContainer}>
              <Text style={styles.plansTitle}>Choose a Plan</Text>

              <View style={styles.planCard}>
                <Text style={styles.planName}>Basic</Text>
                <Text style={styles.planPrice}>₹99/month</Text>
                <Text style={styles.planFeatures}>
                  • All basic features{'\n'}
                  • Standard wallpapers{'\n'}
                  • 30-day message history
                </Text>
              </View>

              <View style={[styles.planCard, styles.recommendedPlan]}>
                <Text style={styles.recommendedBadge}>Recommended</Text>
                <Text style={styles.planName}>Premium</Text>
                <Text style={styles.planPrice}>₹149/month</Text>
                <Text style={styles.planFeatures}>
                  • All basic features{'\n'}
                  • Premium wallpapers{'\n'}
                  • 1-year message history{'\n'}
                  • AI features{'\n'}
                  • Cloud backup
                </Text>
              </View>

              <View style={styles.planCard}>
                <Text style={styles.planName}>Enterprise</Text>
                <Text style={styles.planPrice}>₹499/month</Text>
                <Text style={styles.planFeatures}>
                  • Everything in Premium{'\n'}
                  • Custom branding{'\n'}
                  • Priority support{'\n'}
                  • API access
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, styles.primaryButton]}
              onPress={handleSubscribe}
              activeOpacity={0.8}>
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  activeBadge: {
    backgroundColor: '#22c55e',
  },
  inactiveBadge: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningCard: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  warningTitle: {
    color: '#fef2f2',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
  },
  plansContainer: {
    marginBottom: 24,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  recommendedPlan: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  recommendedBadge: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 12,
  },
  planFeatures: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  subscribeButton: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;

