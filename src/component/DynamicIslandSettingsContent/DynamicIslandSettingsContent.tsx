import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  AppState,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LiveActivityService} from '../../services/LiveActivityService';
import {TEST_MODE} from '../../config/constants';
import ScreenConstants from '../../Routes/ScreenConstants';

type LiveActivityMode =
  | 'yearProgress'
  | 'countdown'
  | 'dayProgress'
  | 'monthProgress'
  | 'pet'
  | 'streak'
  | 'event';

interface TileConfig {
  id: LiveActivityMode;
  title: string;
  subtitle: string;
  emoji: string;
  canCustomize?: boolean;
}

const TILES: TileConfig[] = [
  {id: 'yearProgress', title: 'Year Progress', subtitle: 'Live % of the year', emoji: '📅'},
  {id: 'countdown', title: 'Days Left', subtitle: 'Countdown to year end', emoji: '⏳'},
  {id: 'dayProgress', title: 'Day Status', subtitle: "Today's progress", emoji: '☀️'},
  {id: 'monthProgress', title: 'Month Progress', subtitle: 'Current month %', emoji: '📆'},
  {id: 'pet', title: 'Virtual Pet', subtitle: 'Pet on Dynamic Island', emoji: '🐱', canCustomize: true},
  {id: 'streak', title: 'Consistency Streak', subtitle: 'Show your streak', emoji: '🔥', canCustomize: true},
  {id: 'event', title: 'Event Countdown', subtitle: 'Countdown to an event', emoji: '🎯', canCustomize: true},
];

interface DynamicIslandSettingsContentProps {
  darkTheme?: boolean;
}

const DynamicIslandSettingsContent: React.FC<DynamicIslandSettingsContentProps> = ({
  darkTheme = false,
}) => {
  const navigation = useNavigation();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<LiveActivityMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<LiveActivityMode | null>(null);

  const loadState = useCallback(async () => {
    if (Platform.OS !== 'ios' || !LiveActivityService.isSupported()) {
      setLoading(false);
      return;
    }
    try {
      const [isEnabled, currentMode] = await Promise.all([
        LiveActivityService.isLiveActivityEnabled(),
        LiveActivityService.getLiveActivityMode(),
      ]);
      setEnabled(isEnabled);
      setMode(currentMode);
    } catch {
      setEnabled(false);
      setMode(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        LiveActivityService.checkAndRestoreLiveActivity().then(restored => {
          if (restored) loadState();
        });
      }
    });
    return () => sub.remove();
  }, [loadState]);

  const handleTileToggle = async (tileId: LiveActivityMode, value: boolean) => {
    if (Platform.OS !== 'ios' || !LiveActivityService.isSupported()) return;
    if (!TEST_MODE.BYPASS_DYNAMIC_ISLAND_PREMIUM) {
      Alert.alert('Premium', 'Dynamic Island is a premium feature.');
      return;
    }
    setTogglingId(tileId);
    try {
      if (value) {
        await LiveActivityService.endLiveActivity();
        if (tileId === 'pet') {
          await LiveActivityService.startLiveActivity('pet', {});
        } else if (tileId === 'streak') {
          await LiveActivityService.startLiveActivity('streak', {streakCount: 0});
        } else if (tileId === 'event') {
          await LiveActivityService.startLiveActivity('event', {
            eventName: 'Event',
            eventDate: Math.floor(Date.now() / 1000) + 86400 * 7,
          });
        } else {
          await LiveActivityService.startLiveActivity(tileId, {});
        }
        setEnabled(true);
        setMode(tileId);
      } else {
        await LiveActivityService.endLiveActivity();
        setEnabled(false);
        setMode(null);
      }
    } catch {
      Alert.alert('Error', 'Could not update Dynamic Island.');
    } finally {
      setTogglingId(null);
    }
  };

  const openCustomize = (tileId: LiveActivityMode) => {
    if (tileId === 'pet') {
      navigation.navigate(ScreenConstants.PET_SCREEN as never);
    } else if (tileId === 'streak') {
      Alert.alert('Streak', 'Streak customization coming soon.');
    } else if (tileId === 'event') {
      Alert.alert('Event', 'Event countdown customization coming soon.');
    }
  };

  const isDark = darkTheme;
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  if (Platform.OS !== 'ios') {
    return (
      <View style={[styles.unsupported, {backgroundColor: cardBg}]}>
        <Text style={[styles.unsupportedText, {color: textSecondary}]}>
          Dynamic Island is only available on iOS.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, {backgroundColor: cardBg}]}>
        <Text style={[styles.loadingText, {color: textSecondary}]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      {TILES.map(tile => {
        const isOn = enabled && mode === tile.id;
        const isDisabled = togglingId !== null && togglingId !== tile.id;
        return (
          <View
            key={tile.id}
            style={[
              styles.tile,
              {backgroundColor: cardBg},
              isDisabled && styles.tileDisabled,
            ]}>
            <View style={styles.tileLeft}>
              <Text style={styles.tileEmoji}>{tile.emoji}</Text>
              <View>
                <Text style={[styles.tileTitle, {color: textPrimary}]}>{tile.title}</Text>
                <Text style={[styles.tileSubtitle, {color: textSecondary}]}>{tile.subtitle}</Text>
              </View>
            </View>
            <View style={styles.tileRight}>
              {tile.canCustomize && (
                <TouchableOpacity
                  onPress={() => openCustomize(tile.id)}
                  style={styles.gearButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.gearIcon}>⚙️</Text>
                </TouchableOpacity>
              )}
              <Switch
                value={isOn}
                onValueChange={v => handleTileToggle(tile.id, v)}
                disabled={isDisabled}
                trackColor={{false: '#cbd5e1', true: '#6366f1'}}
                thumbColor="#fff"
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {flex: 1},
  scrollContent: {padding: 16, paddingBottom: 32},
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  tileDisabled: {opacity: 0.6},
  tileLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
  tileEmoji: {fontSize: 24, marginRight: 12},
  tileTitle: {fontSize: 16, fontWeight: '600'},
  tileSubtitle: {fontSize: 12, marginTop: 2},
  tileRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  gearButton: {padding: 4},
  gearIcon: {fontSize: 18},
  unsupported: {padding: 24, borderRadius: 12, margin: 16},
  unsupportedText: {fontSize: 14},
  centered: {padding: 24, alignItems: 'center', justifyContent: 'center'},
  loadingText: {fontSize: 14},
});

export default DynamicIslandSettingsContent;
