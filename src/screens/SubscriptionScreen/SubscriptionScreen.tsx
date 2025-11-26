import React, {useState, useEffect, useCallback} from 'react';
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
import SubscriptionService, {
  SubscriptionStatus,
} from '../../services/SubscriptionService';
import {LANDING_PAGE_CONFIG} from '../../config/constants';

const SubscriptionScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const user = useSelector((state: RootState) => state.userDetails);
  const userId = user?.user?.uid;

  const checkSubscription = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setSubscriptionStatus({
        isActive: false,
        subscriptionType: 'free',
      });
      return;
    }

    try {
      setLoading(true);
      const status = await SubscriptionService.checkSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Set default free subscription on error
      setSubscriptionStatus({
        isActive: false,
        subscriptionType: 'free',
      });
      Alert.alert('Error', 'Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const handleSubscribe = (planType?: 'basic' | 'premium' | 'pro') => {
    if (!userId) {
      Alert.alert(
        'Sign in required',
        'Please log in so we can link the payment to your account.',
      );
      return;
    }

    const queryParams: string[] = [`userId=${encodeURIComponent(userId)}`];
    if (planType) {
      queryParams.push(`plan=${encodeURIComponent(planType)}`);
    }
    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
    try {
      // Construct subscription URL with plan + user identifiers
      const subscriptionUrl = `${LANDING_PAGE_CONFIG.BASE_URL}${LANDING_PAGE_CONFIG.SUBSCRIBE_PATH}${queryString}`;

      console.log('Opening subscription URL:', subscriptionUrl);

      Linking.canOpenURL(subscriptionUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(subscriptionUrl);
          } else {
            Alert.alert(
              'Unable to Open Browser',
              `Please visit our website to subscribe:\n${subscriptionUrl}`,
              [{text: 'OK'}],
            );
          }
        })
        .catch(err => {
          console.error('Error opening subscription URL:', err);
          Alert.alert(
            'Error',
            'Unable to open browser. Please visit: ' + subscriptionUrl,
            [{text: 'OK'}],
          );
        });
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
        overScrollMode="auto">
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Subscription</Text>
            <Text style={styles.subtitle}>Manage your subscription plan</Text>
          </View>
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
              onPress={() => handleSubscribe()}
              activeOpacity={0.8}>
              <Text style={styles.subscribeButtonText}>
                Manage Subscription
              </Text>
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
                You need an active subscription to use this app. Please
                subscribe to continue.
              </Text>
            </View>

            {/* Launch Special Banner */}
            <View style={styles.bannerContainer}>
              <View style={styles.banner}>
                <Text style={styles.bannerBadge}>🎉 Launch Special</Text>
                <Text style={styles.bannerText}>
                  Up to 60% OFF on Premium & Pro plans - Limited time only!
                </Text>
              </View>
            </View>

            <View style={styles.plansContainer}>
              <View>
                <Text style={styles.plansTitle}>Choose a Plan</Text>
              </View>

              {/* Basic Plan */}
              <View style={styles.planCard}>
                <Text style={styles.planName}>Basic</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>₹3</Text>
                  <Text style={styles.priceCadence}>/month</Text>
                </View>
                <Text style={styles.priceSubtext}>Affordable entry plan</Text>
                <Text style={styles.planValue}>
                  Perfect for trying out private messaging
                </Text>
                <Text style={styles.planFeatures}>
                  ✓ End-to-end encrypted messaging{'\n'}✓ 1-on-1 & group chats
                  (up to 10 members){'\n'}✓ 30-day message history{'\n'}✓
                  Standard wallpaper library{'\n'}✓ PIN lock & inactivity
                  auto-lock{'\n'}✓ Disguised notifications{'\n'}✓ Basic privacy
                  controls{'\n'}✓ Message search (last 30 days)
                </Text>
                <View style={styles.limitationsContainer}>
                  <Text style={styles.limitationsTitle}>Limitations</Text>
                  <Text style={styles.limitationsText}>
                    • Limited to 5 active chats{'\n'}• Standard wallpapers only
                    {'\n'}• 30-day message retention
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.planSubscribeButton}
                  onPress={() => handleSubscribe('basic')}
                  activeOpacity={0.8}>
                  <Text style={styles.planSubscribeButtonText}>
                    Subscribe to Basic
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Premium Plan - Recommended */}
              <View style={[styles.planCard, styles.recommendedPlan]}>
                <View style={styles.recommendedBadgeContainer}>
                  <Text style={styles.recommendedBadge}>Recommended</Text>
                </View>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>60% OFF</Text>
                </View>
                <Text style={styles.planName}>Premium</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>₹499</Text>
                  <Text style={styles.planPrice}>₹199</Text>
                  <Text style={styles.priceCadence}>/month</Text>
                </View>
                <Text style={styles.priceSubtext}>Save ₹3,600/year</Text>
                <Text style={styles.planValue}>
                  Best value for privacy-conscious users
                </Text>
                <Text style={styles.planFeatures}>
                  ✓ Everything in Basic{'\n'}✓ Unlimited chats & group members
                  {'\n'}✓ Unlimited message history{'\n'}✓ Premium HD wallpapers
                  (exclusive){'\n'}✓ Cloud backup & sync{'\n'}✓ Advanced search
                  (full history){'\n'}✓ Message pinning & advanced features
                  {'\n'}✓ Priority customer support{'\n'}✓ Early access to new
                  features{'\n'}✓ No ads or limitations
                </Text>
                <TouchableOpacity
                  style={[
                    styles.planSubscribeButton,
                    styles.planSubscribeButtonPrimary,
                  ]}
                  onPress={() => handleSubscribe('premium')}
                  activeOpacity={0.8}>
                  <Text style={styles.planSubscribeButtonText}>
                    Subscribe to Premium
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Pro Plan */}
              <View style={styles.planCard}>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>50% OFF</Text>
                </View>
                <Text style={styles.planName}>Pro</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>₹999</Text>
                  <Text style={styles.planPrice}>₹499</Text>
                  <Text style={styles.priceCadence}>/month</Text>
                </View>
                <Text style={styles.priceSubtext}>Save ₹6,000/year</Text>
                <Text style={styles.planValue}>For teams & power users</Text>
                <Text style={styles.planFeatures}>
                  ✓ Everything in Premium{'\n'}✓ Multi-device sync (up to 5
                  devices){'\n'}✓ Team collaboration tools{'\n'}✓ Advanced admin
                  controls{'\n'}✓ Custom wallpaper uploads{'\n'}✓ Bulk message
                  management{'\n'}✓ Export chat history{'\n'}✓ Dedicated support
                  channel{'\n'}✓ Custom branding options{'\n'}✓ API access
                  (coming soon)
                </Text>
                <TouchableOpacity
                  style={styles.planSubscribeButton}
                  onPress={() => handleSubscribe('pro')}
                  activeOpacity={0.8}>
                  <Text style={styles.planSubscribeButtonText}>
                    Subscribe to Pro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Trust Indicators */}
            <View style={styles.trustContainer}>
              <View style={styles.trustCard}>
                <Text style={styles.trustIcon}>🔒</Text>
                <Text style={styles.trustTitle}>7-Day Money Back</Text>
                <Text style={styles.trustText}>
                  Not satisfied? Get full refund
                </Text>
              </View>
              <View style={styles.trustCard}>
                <Text style={styles.trustIcon}>⚡</Text>
                <Text style={styles.trustTitle}>Cancel Anytime</Text>
                <Text style={styles.trustText}>No long-term contracts</Text>
              </View>
              <View style={styles.trustCard}>
                <Text style={styles.trustIcon}>🛡️</Text>
                <Text style={styles.trustTitle}>Secure & Private</Text>
                <Text style={styles.trustText}>End-to-end encryption</Text>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  header: {
    flex: 1,
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
  bannerContainer: {
    marginBottom: 24,
  },
  banner: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bannerBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  bannerText: {
    color: '#fef3c7',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
    overflow: 'visible',
  },
  recommendedPlan: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderWidth: 2.5,
  },
  recommendedBadgeContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    zIndex: 10,
  },
  recommendedBadge: {
    backgroundColor: '#a855f7',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  savingsBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  savingsBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 18,
    color: '#64748b',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a855f7',
    marginRight: 4,
  },
  priceCadence: {
    fontSize: 16,
    color: '#94a3b8',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
    marginBottom: 8,
  },
  planValue: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  planFeatures: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  limitationsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  limitationsTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  limitationsText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  trustContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  trustCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 4,
  },
  trustIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
    textAlign: 'center',
  },
  trustText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
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
  planSubscribeButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  planSubscribeButtonPrimary: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  planSubscribeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
