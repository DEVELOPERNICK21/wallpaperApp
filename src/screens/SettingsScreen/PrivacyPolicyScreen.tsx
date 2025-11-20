import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

const policySections = [
  {
    title: 'What Wallpaper Chat (Disguise) is',
    body: 'Wallpaper Chat disguises a secure messenger inside a wallpaper gallery. The disguise is meant to protect lawful, high-risk communication—not to hide criminal behavior.',
  },
  {
    title: 'Data We Handle',
    bullets: [
      'Account basics: email or phone, device identifiers, and subscription status.',
      'Encrypted communications: messages, media, and metadata stay end-to-end encrypted; we can’t read their contents.',
      'Usage telemetry: crash logs and aggregated performance stats so we can keep the disguise working smoothly.',
    ],
  },
  {
    title: 'What We Never Do',
    bullets: [
      'Sell personal data to advertisers.',
      'Show message contents in notifications or outside the disguised UI.',
      'Share user data with third parties unless legally required.',
    ],
  },
  {
    title: 'Acceptable Use & Abuse Prevention',
    body: 'You may not use Wallpaper Chat for harassment, exploitation, terrorism, or any other illegal activity. We track abuse signals (suspicious payment patterns, law-enforcement requests, serious user reports) and will suspend or delete accounts involved in unlawful behavior.',
  },
  {
    title: 'How We Respond to Issues',
    bullets: [
      'We maintain an escalation channel for credible abuse reports (founders@wallpaperchat.app).',
      'We cooperate with lawful investigations when presented with valid legal process.',
      'We reserve the right to remotely revoke access, wipe content, or disable disguises that violate this policy.',
    ],
  },
  {
    title: 'How You Stay Safe',
    bullets: [
      'Only add contacts you trust and report suspicious users immediately.',
      'Use PIN + inactivity lock to keep devices secure if confiscated.',
      'Keep backups of legal documents demonstrating your compliance in case authorities ask.',
    ],
  },
];

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        style={styles.contentWrapper}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.lede}>
          This policy explains how Wallpaper Chat (also called Disguise) protects
          your information, the limited data we retain, and the rules every user
          must follow to keep the platform lawful.
        </Text>

        {policySections.map(section => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body ? (
              <Text style={styles.sectionBody}>{section.body}</Text>
            ) : null}
            {section.bullets ? (
              <View style={styles.bulletGroup}>
                {section.bullets.map(point => (
                  <View key={point} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact & Reporting</Text>
          <Text style={styles.sectionBody}>
            If you suspect illegal use, email founders@wallpaperchat.app with
            timestamps, usernames, or screenshots. We review urgent reports
            within 24 hours and coordinate with trusted authorities when needed.
          </Text>
        </View>

        <Text style={styles.footerNote}>
          Using Wallpaper Chat means you accept this policy and agree to operate
          within the law of your jurisdiction. We may update this document to
          reflect new regulations or features.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: colors?.primaryColor,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors?.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  headerSpacer: {
    width: 40,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  lede: {
    fontSize: 14,
    color: '#cbd5f5',
    lineHeight: 22,
    marginTop: 20,
    fontFamily: fonts?.PoppinsRegular,
  },
  sectionCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionTitle: {
    fontSize: 16,
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: '#cbd5f5',
    lineHeight: 22,
    fontFamily: fonts?.PoppinsRegular,
  },
  bulletGroup: {
    marginTop: 10,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    color: colors?.primaryColor,
    fontSize: 20,
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5f5',
    lineHeight: 20,
    fontFamily: fonts?.PoppinsRegular,
  },
  footerNote: {
    marginTop: 24,
    marginBottom: 40,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: fonts?.PoppinsRegular,
  },
});

export default PrivacyPolicyScreen;

