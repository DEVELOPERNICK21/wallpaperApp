import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../Routes/ScreenConstants';
import {colors} from '../assets/color';
import {SubscriptionStatus} from '../services/SubscriptionService';

type Props = {
  featureName?: string;
  subscriptionStatus?: SubscriptionStatus | null;
  loading?: boolean;
  onRefresh?: () => void;
};

const formatDate = (date?: Date) => {
  if (!date) {
    return '';
  }

  try {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return date.toDateString();
  }
};

const SubscriptionRequiredView: React.FC<Props> = ({
  featureName = 'use this feature',
  subscriptionStatus,
  loading,
  onRefresh,
}) => {
  const navigation = useNavigation();
  const planLabel =
    subscriptionStatus?.subscriptionType &&
    subscriptionStatus.subscriptionType !== 'free'
      ? subscriptionStatus.subscriptionType.toUpperCase()
      : 'NO PLAN';

  const isExpired =
    subscriptionStatus &&
    subscriptionStatus.subscriptionType !== 'free' &&
    !subscriptionStatus.isActive;

  const hasPlan = subscriptionStatus?.subscriptionType !== 'free';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>
          {hasPlan ? `${planLabel} PLAN` : 'PLAN REQUIRED'}
        </Text>
        <Text style={styles.title}>Subscription Required</Text>
        <Text style={styles.subtitle}>
          {hasPlan && isExpired
            ? 'Your subscription ended. Renew to keep your private chats unlocked.'
            : 'Choose any paid plan to unlock chatting and secure features.'}
        </Text>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusLabel}>Feature</Text>
            <Text style={styles.statusValue}>{featureName}</Text>
          </View>
          {subscriptionStatus?.endDate && (
            <View style={[styles.statusPill, styles.statusPillEnd]}>
              <Text style={styles.statusLabel}>
                {isExpired ? 'Expired' : 'Renews'}
              </Text>
              <Text style={styles.statusValue}>
                {formatDate(subscriptionStatus.endDate)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(ScreenConstants.SUBSCRIPTION_SCREEN as never)
          }>
          <Text style={styles.primaryButtonText}>
            {hasPlan ? 'Renew Subscription' : 'View Plans'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(ScreenConstants.SUBSCRIPTION_SCREEN as never)
          }>
          <Text style={styles.secondaryButtonText}>Why subscriptions?</Text>
        </TouchableOpacity>

        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            activeOpacity={0.85}
            onPress={onRefresh}>
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh status</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Paid plans unlock:</Text>
          <Text style={styles.benefitItem}>• Unlimited secure chats</Text>
          <Text style={styles.benefitItem}>• Wallpaper disguise & stealth</Text>
          <Text style={styles.benefitItem}>• Priority privacy protections</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040615',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56,189,248,0.15)',
    color: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  statusPill: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'rgba(15,118,110,0.15)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  statusPillEnd: {
    marginRight: 0,
  },
  statusLabel: {
    fontSize: 12,
    color: '#5eead4',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#cbd5f5',
    fontWeight: '600',
    fontSize: 15,
  },
  refreshButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
  },
  benefits: {
    marginTop: 24,
    backgroundColor: 'rgba(8,47,73,0.4)',
    borderRadius: 16,
    padding: 16,
  },
  benefitsTitle: {
    color: '#93c5fd',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
  },
  benefitItem: {
    color: '#cbd5f5',
    fontSize: 14,
    marginTop: 4,
  },
});

export default SubscriptionRequiredView;

