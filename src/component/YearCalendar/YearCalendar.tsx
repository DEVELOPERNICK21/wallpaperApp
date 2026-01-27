import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Alert,
  Platform,
  PermissionsAndroid,
  Image,
  AppState,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFS from 'react-native-fs'; // Not used in this component
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import ManageWallpaper from 'react-native-manage-wallpaper';

// Optional: react-native-view-shot for image capture
// Install with: npm install react-native-view-shot
let ViewShot: any = null;
try {
  ViewShot = require('react-native-view-shot').default;
} catch (e) {
  console.warn('react-native-view-shot not installed. Install it to use wallpaper feature.');
}

const {width, height} = Dimensions.get('window');

// Psychology-based color themes
const colorThemes = {
  ocean: {
    name: 'Ocean Blue',
    description: 'Calm, trustworthy, professional',
    passed: '#3b82f6', // Blue
    today: '#f59e0b', // Amber
    future: '#1e3a8a', // Dark blue
    background: '#0f172a',
    accent: '#60a5fa',
  },
  forest: {
    name: 'Forest Green',
    description: 'Growth, harmony, balance',
    passed: '#10b981', // Emerald
    today: '#f97316', // Orange
    future: '#064e3b', // Dark green
    background: '#0f172a',
    accent: '#34d399',
  },
  sunset: {
    name: 'Sunset Orange',
    description: 'Energy, enthusiasm, creativity',
    passed: '#f97316', // Orange
    today: '#ef4444', // Red
    future: '#7c2d12', // Dark orange
    background: '#0f172a',
    accent: '#fb923c',
  },
  purple: {
    name: 'Royal Purple',
    description: 'Creativity, luxury, wisdom',
    passed: '#a855f7', // Purple
    today: '#f59e0b', // Amber
    future: '#581c87', // Dark purple
    background: '#0f172a',
    accent: '#c084fc',
  },
  neon: {
    name: 'Neon Cyan',
    description: 'Modern, tech, attention-grabbing',
    passed: '#06b6d4', // Cyan
    today: '#f59e0b', // Amber
    future: '#164e63', // Dark cyan
    background: '#0f172a',
    accent: '#22d3ee',
  },
  rose: {
    name: 'Rose Gold',
    description: 'Elegance, warmth, sophistication',
    passed: '#ec4899', // Pink
    today: '#f59e0b', // Amber
    future: '#831843', // Dark pink
    background: '#0f172a',
    accent: '#f472b6',
  },
  classic: {
    name: 'Classic White',
    description: 'Clean, minimal, timeless',
    passed: '#ffffff', // White
    today: '#f97316', // Orange
    future: '#ffffff', // White (for future days, shown with opacity)
    background: '#000000', // Pure black
    accent: '#94a3b8',
  },
};

interface YearCalendarProps {
  year?: number;
  fullScreen?: boolean;
  onClose?: () => void;
}

const YearCalendar: React.FC<YearCalendarProps> = ({
  year,
  fullScreen = false,
  onClose,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof colorThemes>('classic');
  // const [showThemeSelector, setShowThemeSelector] = useState(false); // Not currently used
  const [isCapturing, setIsCapturing] = useState(false);
  const [showWallpaperPreview, setShowWallpaperPreview] = useState(false);
  const [wallpaperPreviewUri, setWallpaperPreviewUri] = useState<string | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateType, setAutoUpdateType] = useState<'home' | 'lock' | 'both'>('both');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  const currentTheme = colorThemes[selectedTheme];
  const currentYear = year || new Date().getFullYear();
  const today = useMemo(() => new Date(), []);
  const startOfYear = useMemo(() => new Date(currentYear, 0, 1), [currentYear]);

  // Calculate if it's a leap year
  const isLeapYear = (yearToCheck: number) => {
    return (yearToCheck % 4 === 0 && yearToCheck % 100 !== 0) || yearToCheck % 400 === 0;
  };

  const totalDays = isLeapYear(currentYear) ? 366 : 365;
  const daysPassed = useMemo(() => {
    const diffTime = today.getTime() - startOfYear.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diffDays, 0), totalDays);
  }, [today, startOfYear, totalDays]);

  const daysRemaining = totalDays - daysPassed;
  const percentageComplete = ((daysPassed / totalDays) * 100).toFixed(1);

  // Calculate weeks (52 weeks = 364 days, add 1-2 days for remainder)
  // const weeksInYear = 52; // Not used
  // const daysPerWeek = 7; // Not used
  // const totalCells = weeksInYear * daysPerWeek; // 364 cells
  // const extraDays = totalDays - totalCells; // 1 or 2 extra days - not used

  // Get date for a specific day index
  const getDateForDay = (dayIndex: number) => {
    const date = new Date(startOfYear);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  // Format date
  const formatDate = (date: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Generate dots for the year with consistent grid layout
  const renderDots = (isFullScreen: boolean = false) => {
    const containerPadding = isFullScreen ? 20 : 40;
    const availableWidth = width - containerPadding * 2;

    // Calculate optimal number of columns for consistent grid
    // Aim for 12-15 columns to match wallpaper design (12 columns shown in image)
    const optimalColumns = isFullScreen ? 12 : 12;
    const rows = Math.ceil(totalDays / optimalColumns);

    // Calculate available height for full screen (60% of screen height minus padding)
    const availableHeight = isFullScreen
      ? (height * 0.6) - 40 // Subtract padding
      : height * 0.4; // For card view

    // Calculate spacing - consistent spacing between dots
    const colSpacing = isFullScreen ? 12 : 8;
    const rowSpacing = isFullScreen ? 12 : 8;

    // Calculate dot size based on available width
    // Formula: availableWidth = (dotSize * columns) + (colSpacing * (columns - 1))
    const calculatedDotSizeFromWidth = (availableWidth - (colSpacing * (optimalColumns - 1))) / optimalColumns;

    // Calculate dot size based on available height
    // Formula: availableHeight = (dotSize * rows) + (rowSpacing * (rows - 1))
    const calculatedDotSizeFromHeight = (availableHeight - (rowSpacing * (rows - 1))) / rows;

    // Use the smaller of the two to ensure dots fit both width and height
    let dotSize = Math.min(calculatedDotSizeFromWidth, calculatedDotSizeFromHeight);

    // Set optimal dot size range - not too small, not too big
    if (isFullScreen) {
      dotSize = Math.max(Math.min(dotSize, 18), 12); // Full screen: 12-18px
    } else {
      dotSize = Math.max(Math.min(dotSize, 14), 8); // Card view: 8-14px
    }

    // Create grid rows
    const gridRows = [];
    for (let row = 0; row < rows; row++) {
      const rowDots = [];
      for (let col = 0; col < optimalColumns; col++) {
        const dayIndex = row * optimalColumns + col;

        if (dayIndex >= totalDays) {
          // Empty cell for remaining days
          rowDots.push(
            <View
              key={`empty-${row}-${col}`}
              style={{
                width: dotSize,
                height: dotSize,
                marginRight: col < optimalColumns - 1 ? colSpacing : 0,
              }}
            />
          );
        } else {
          const isPassed = dayIndex < daysPassed;
          const isToday = dayIndex === daysPassed - 1;
          const isSelected = selectedDay === dayIndex;

          rowDots.push(
            <TouchableOpacity
              key={`day-${dayIndex}`}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedDay(dayIndex);
                if (!isFullScreen) {
                  setShowFullScreen(true);
                }
              }}
              style={{
                marginRight: col < optimalColumns - 1 ? colSpacing : 0,
              }}>
              <View
                style={[
                  styles.dot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: isPassed
                      ? isToday
                        ? currentTheme.today
                        : currentTheme.passed
                      : currentTheme.future,
                    opacity: isPassed ? 1 : 0.4,
                    borderWidth: isToday ? 2 : isSelected ? 1.5 : 0,
                    borderColor: isToday ? currentTheme.today : currentTheme.accent,
                    transform: [{scale: isSelected ? 1.2 : 1}],
                  },
                ]}
              />
            </TouchableOpacity>
          );
        }
      }

      gridRows.push(
        <View
          key={`row-${row}`}
          style={{
            flexDirection: 'row',
            marginBottom: row < rows - 1 ? rowSpacing : 0,
            justifyContent: 'flex-start',
          }}>
          {rowDots}
        </View>
      );
    }

    return gridRows;
  };

  // Load auto-update preferences
  useEffect(() => {
    const loadAutoUpdatePreferences = async () => {
      try {
        const enabled = await AsyncStorage.getItem('calendarAutoUpdateEnabled');
        const type = await AsyncStorage.getItem('calendarAutoUpdateType');
        if (enabled !== null) {
          setAutoUpdateEnabled(enabled === 'true');
        }
        if (type !== null && (type === 'home' || type === 'lock' || type === 'both')) {
          setAutoUpdateType(type);
        }
      } catch (error) {
        console.error('Error loading auto-update preferences:', error);
      }
    };
    loadAutoUpdatePreferences();
  }, []);

  // Check if wallpaper needs updating (if a day has passed)
  const shouldUpdateWallpaper = async (): Promise<boolean> => {
    try {
      const lastUpdateDate = await AsyncStorage.getItem('calendarLastUpdateDate');
      if (!lastUpdateDate) {
        return true; // Never updated, should update
      }

      const lastUpdate = new Date(lastUpdateDate);
      const currentDate = new Date();
      const todayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const lastUpdateDateOnly = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate());

      // Check if a new day has started
      return todayDate.getTime() > lastUpdateDateOnly.getTime();
    } catch (error) {
      console.error('Error checking update status:', error);
      return false;
    }
  };



  React.useEffect(() => {
    if (showFullScreen) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFullScreen, fadeAnim]);

  // Request Storage Permission (Android)
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 33) {
        const readPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        return readPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      return false;
    }
  };

  // Capture calendar as image
  const captureCalendar = async (): Promise<string | null> => {
    if (!ViewShot || !viewShotRef.current) {
      Alert.alert(
        'Installation Required',
        'Please install react-native-view-shot to use this feature:\n\nnpm install react-native-view-shot\n\nThen rebuild the app.',
      );
      return null;
    }

    try {
      setIsCapturing(true);
      const uri = await viewShotRef.current.capture();
      return uri;
    } catch (error) {
      console.error('Error capturing calendar:', error);
      Alert.alert('Error', 'Failed to capture calendar image.');
      return null;
    } finally {
      setIsCapturing(false);
    }
  };


  // Show wallpaper preview first - opens full screen if not already
  const showWallpaperPreviewModal = async () => {
    if (!ViewShot) {
      Alert.alert(
        'Installation Required',
        'Please install react-native-view-shot:\n\nnpm install react-native-view-shot\n\nThen rebuild the app.',
      );
      return;
    }

    // If not in full screen, open it first
    if (!fullScreen) {
      setShowFullScreen(true);
      // Wait a bit for full screen to render, then capture
      setTimeout(async () => {
        try {
          setIsCapturing(true);
          const uri = await captureCalendar();

          if (uri) {
            setWallpaperPreviewUri(uri);
            setShowWallpaperPreview(true);
          }
        } catch (error) {
          console.error('Error capturing preview:', error);
          Alert.alert('Error', 'Failed to capture calendar preview.');
        } finally {
          setIsCapturing(false);
        }
      }, 500);
    } else {
      // Already in full screen, capture immediately
      try {
        setIsCapturing(true);
        const uri = await captureCalendar();

        if (uri) {
          setWallpaperPreviewUri(uri);
          setShowWallpaperPreview(true);
        }
      } catch (error) {
        console.error('Error capturing preview:', error);
        Alert.alert('Error', 'Failed to capture calendar preview.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  // Show wallpaper options after preview
  const showWallpaperOptions = () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Set Calendar as Wallpaper',
        'Choose where to set the calendar:',
        [
          {text: 'Cancel', style: 'cancel', onPress: () => setShowWallpaperPreview(false)},
          {
            text: 'Home Screen',
            onPress: async () => {
              if (wallpaperPreviewUri) {
                await setCalendarAsWallpaperFromUri(wallpaperPreviewUri, 'home');
                setShowWallpaperPreview(false);
              }
            },
          },
          {
            text: 'Lock Screen',
            onPress: async () => {
              if (wallpaperPreviewUri) {
                await setCalendarAsWallpaperFromUri(wallpaperPreviewUri, 'lock');
                setShowWallpaperPreview(false);
              }
            },
          },
          {
            text: 'Both',
            onPress: async () => {
              if (wallpaperPreviewUri) {
                await setCalendarAsWallpaperFromUri(wallpaperPreviewUri, 'both');
                setShowWallpaperPreview(false);
              }
            },
          },
        ],
      );
    } else {
      // iOS - save to gallery
      Alert.alert(
        'Save Calendar',
        'Save the calendar to your gallery?',
        [
          {text: 'Cancel', style: 'cancel', onPress: () => setShowWallpaperPreview(false)},
          {
            text: 'Save',
            onPress: async () => {
              const hasPermission = await requestStoragePermission();
              if (!hasPermission) {
                Alert.alert('Permission Denied', 'Storage permission is required.');
                setShowWallpaperPreview(false);
                return;
              }
              if (wallpaperPreviewUri) {
                await CameraRoll.save(wallpaperPreviewUri, {type: 'photo'});
                Alert.alert('Saved!', 'Calendar saved to your gallery.');
                setShowWallpaperPreview(false);
              }
            },
          },
        ],
      );
    }
  };

  // Set wallpaper from captured URI
  const setCalendarAsWallpaperFromUri = async (
    uri: string,
    type: 'home' | 'lock' | 'both',
  ) => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Set wallpaper based on type
      let callback;
      switch (type) {
        case 'home':
          callback = ManageWallpaper.TYPE.HOME;
          break;
        case 'lock':
          callback = ManageWallpaper.TYPE.LOCK;
          break;
        case 'both':
          callback = ManageWallpaper.TYPE.BOTH;
          break;
      }

      await ManageWallpaper.setWallpaper({uri}, callback);

      Alert.alert(
        'Calendar Set as Wallpaper! 🎨',
        `Your year calendar has been set as your ${
          type === 'both'
            ? 'home and lock screen'
            : type === 'home'
            ? 'home screen'
            : 'lock screen'
        } wallpaper.`,
        [{text: 'Awesome!', style: 'default'}],
      );
    } catch (error) {
      console.error('Error setting wallpaper:', error);
      Alert.alert(
        'Failed to Set Wallpaper',
        'An error occurred. Please try again.',
      );
    }
  };

  // Auto-update wallpaper function
  // NOTE: This only works when app is opened/active, NOT true background updates
  // For true daily background updates, you need react-native-background-fetch
  // See: src/services/WallpaperBackgroundService.ts
  const autoUpdateWallpaper = async () => {
    if (!autoUpdateEnabled || Platform.OS !== 'android') {
      return;
    }

    try {
      const needsUpdate = await shouldUpdateWallpaper();
      if (!needsUpdate) {
        return; // Already updated today
      }

      // For auto-update, ensure we capture in full screen mode for best quality
      if (!ViewShot || !viewShotRef.current) {
        console.warn('ViewShot not available for auto-update');
        return;
      }

      // Capture the calendar
      const uri = await captureCalendar();
      if (uri) {
        await setCalendarAsWallpaperFromUri(uri, autoUpdateType);
        // Save last update date
        await AsyncStorage.setItem('calendarLastUpdateDate', new Date().toISOString());
        console.log('Wallpaper updated (app-opened trigger)');
      }
    } catch (error) {
      console.error('Error auto-updating wallpaper:', error);
    }
  };

  // Save auto-update preferences
  const saveAutoUpdatePreferences = async (enabled: boolean, type: 'home' | 'lock' | 'both') => {
    try {
      await AsyncStorage.setItem('calendarAutoUpdateEnabled', enabled.toString());
      await AsyncStorage.setItem('calendarAutoUpdateType', type);
      setAutoUpdateEnabled(enabled);
      setAutoUpdateType(type);

      if (enabled) {
        // Immediately update wallpaper when enabled
        autoUpdateWallpaper();
      }
    } catch (error) {
      console.error('Error saving auto-update preferences:', error);
    }
  };

  // Check and auto-update when app becomes active
  // IMPORTANT: This is NOT a true background task - it only runs when app opens
  // For true daily background updates, implement react-native-background-fetch
  // See: src/services/WallpaperBackgroundService.ts for proper implementation
  useEffect(() => {
    if (!autoUpdateEnabled) {
      return;
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, check if update is needed
        // This is the "app-opened" trigger, NOT a true background task
        autoUpdateWallpaper();
      }
      appState.current = nextAppState;
    });

    // Also check on initial mount (with a small delay to ensure component is ready)
    const timer = setTimeout(() => {
      autoUpdateWallpaper();
    }, 1000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdateEnabled, autoUpdateType]);

  const calendarView = (
    <View style={[fullScreen ? styles.fullScreenContainer : styles.container, {backgroundColor: currentTheme.background}]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Year Calendar</Text>
              <Text style={styles.subtitle}>
                Track the current year's progress
              </Text>
            </View>
            {fullScreen && onClose && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Theme Selector */}
          <View style={styles.themeSelectorContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themeScrollContent}>
              {Object.entries(colorThemes).map(([key, theme]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.themeOption,
                    selectedTheme === key && styles.selectedTheme,
                    {borderColor: theme.accent},
                  ]}
                  onPress={() => setSelectedTheme(key as keyof typeof colorThemes)}>
                  <View
                    style={[
                      styles.themeColorPreview,
                      {backgroundColor: theme.passed},
                    ]}
                  />
                  <Text
                    style={[
                      styles.themeName,
                      selectedTheme === key && styles.selectedThemeName,
                    ]}>
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          fullScreen && styles.fullScreenScrollContent,
        ]}
        style={fullScreen && {height: height * 0.6}}>
        <View
          style={[
            styles.calendarContainer,
            fullScreen && styles.fullScreenCalendarContainer,
          ]}>
          <View style={styles.dotsGrid}>{renderDots(fullScreen)}</View>
        </View>

        {selectedDay !== null && (
          <Animated.View
            style={[
              styles.selectedDayInfo,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.selectedDayTitle}>
              {formatDate(getDateForDay(selectedDay))}
            </Text>
            <Text style={styles.selectedDaySubtitle}>
              Day {selectedDay + 1} of {totalDays}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: currentTheme.accent}]}>
            {percentageComplete}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: currentTheme.passed}]}>
            {daysPassed}
          </Text>
          <Text style={styles.statLabel}>Days Passed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: currentTheme.future}]}>
            {daysRemaining}
          </Text>
          <Text style={styles.statLabel}>Days Left</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, {color: currentTheme.accent}]}>
          {daysRemaining}d left · {percentageComplete}%
        </Text>
      </View>

      {/* Auto-Update Settings */}
      <View style={styles.autoUpdateContainer}>
        <View style={styles.autoUpdateHeader}>
          <View style={styles.autoUpdateTitleContainer}>
            <Text style={styles.autoUpdateTitle}>🔄 Daily Auto-Update</Text>
            {Platform.OS === 'android' ? (
              <Text style={styles.autoUpdateSubtitle}>
                Updates when app opens (requires background task setup)
              </Text>
            ) : (
              <Text style={styles.autoUpdateSubtitle}>
                ⚠️ iOS: Manual update only (Apple restriction)
              </Text>
            )}
          </View>
          {Platform.OS === 'android' && (
            <Switch
              value={autoUpdateEnabled}
              onValueChange={(value) => saveAutoUpdatePreferences(value, autoUpdateType)}
              trackColor={{false: '#334155', true: currentTheme.accent}}
              thumbColor={autoUpdateEnabled ? '#ffffff' : '#94a3b8'}
            />
          )}
        </View>

        {Platform.OS === 'android' && autoUpdateEnabled && (
          <>
            <View style={styles.autoUpdateOptions}>
              <Text style={styles.autoUpdateOptionsTitle}>Update:</Text>
              <View style={styles.autoUpdateButtons}>
                <TouchableOpacity
                  style={[
                    styles.autoUpdateButton,
                    autoUpdateType === 'home' && styles.autoUpdateButtonActive,
                    autoUpdateType === 'home' && {backgroundColor: currentTheme.accent},
                  ]}
                  onPress={() => saveAutoUpdatePreferences(true, 'home')}>
                  <Text
                    style={[
                      styles.autoUpdateButtonText,
                      autoUpdateType === 'home' && styles.autoUpdateButtonTextActive,
                    ]}>
                    Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.autoUpdateButton,
                    autoUpdateType === 'lock' && styles.autoUpdateButtonActive,
                    autoUpdateType === 'lock' && {backgroundColor: currentTheme.accent},
                  ]}
                  onPress={() => saveAutoUpdatePreferences(true, 'lock')}>
                  <Text
                    style={[
                      styles.autoUpdateButtonText,
                      autoUpdateType === 'lock' && styles.autoUpdateButtonTextActive,
                    ]}>
                    Lock
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.autoUpdateButton,
                    autoUpdateType === 'both' && styles.autoUpdateButtonActive,
                    autoUpdateType === 'both' && {backgroundColor: currentTheme.accent},
                  ]}
                  onPress={() => saveAutoUpdatePreferences(true, 'both')}>
                  <Text
                    style={[
                      styles.autoUpdateButtonText,
                      autoUpdateType === 'both' && styles.autoUpdateButtonTextActive,
                    ]}>
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.autoUpdateWarning}>
              <Text style={styles.autoUpdateWarningText}>
                ⚠️ Note: Wallpaper updates when app opens. For true daily auto-update, install react-native-background-fetch and configure background tasks.
              </Text>
            </View>
          </>
        )}

        {Platform.OS === 'ios' && (
          <View style={styles.autoUpdateIOSInfo}>
            <Text style={styles.autoUpdateIOSInfoText}>
              iOS does not allow automatic wallpaper changes. Please manually update your wallpaper daily using the "Set as Wallpaper" button.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!fullScreen && (
          <TouchableOpacity
            style={styles.fullScreenButton}
            onPress={() => setShowFullScreen(true)}>
            <Text style={styles.fullScreenButtonText}>
              View Full Screen →
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.setWallpaperButton, {backgroundColor: currentTheme.accent}]}
          onPress={showWallpaperPreviewModal}
          disabled={isCapturing}>
          <Text style={styles.setWallpaperButtonText}>
            {isCapturing
              ? 'Capturing...'
              : Platform.OS === 'android'
              ? '📱 Set as Wallpaper'
              : '💾 Save to Gallery'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Wrap calendar view with ViewShot for image capture
  const calendarContent = ViewShot ? (
    <ViewShot
      ref={viewShotRef}
      options={{format: 'jpg', quality: 0.95, result: 'tmpfile'}}
      style={fullScreen ? styles.fullScreenContainer : styles.container}>
      {calendarView}
    </ViewShot>
  ) : (
    calendarView
  );

  if (fullScreen) {
    return calendarContent;
  }

  return (
    <>
      {calendarContent}
      <Modal
        visible={showFullScreen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowFullScreen(false);
          setSelectedDay(null);
        }}>
        <View style={styles.modalContainer}>
          <YearCalendar
            year={year}
            fullScreen={true}
            onClose={() => {
              setShowFullScreen(false);
              setSelectedDay(null);
            }}
          />
        </View>
      </Modal>

      {/* Wallpaper Preview Modal */}
      <Modal
        visible={showWallpaperPreview}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowWallpaperPreview(false)}>
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Wallpaper Preview</Text>
              <TouchableOpacity
                onPress={() => setShowWallpaperPreview(false)}
                style={styles.previewCloseButton}>
                <Text style={styles.previewCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {wallpaperPreviewUri && (
              <View style={styles.previewImageContainer}>
                <Image
                  source={{uri: wallpaperPreviewUri}}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <Text style={styles.previewHint}>
                  This is how your calendar will look as wallpaper
                </Text>
              </View>
            )}

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.previewCancelButton}
                onPress={() => setShowWallpaperPreview(false)}>
                <Text style={styles.previewCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewSetButton, {backgroundColor: currentTheme.accent}]}
                onPress={showWallpaperOptions}>
                <Text style={styles.previewSetText}>
                  {Platform.OS === 'android' ? 'Set Wallpaper' : 'Save to Gallery'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    margin: 15,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: height * 0.7,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 20,
  },
  themeSelectorContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  themeScrollContent: {
    paddingHorizontal: 5,
    gap: 10,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    marginRight: 8,
  },
  selectedTheme: {
    borderWidth: 2,
    backgroundColor: '#334155',
  },
  themeColorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  themeName: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  selectedThemeName: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  fullScreenScrollContent: {
    paddingBottom: 20,
    minHeight: height * 0.6,
  },
  calendarContainer: {
    marginBottom: 20,
    minHeight: 200,
  },
  fullScreenCalendarContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
    minHeight: height * 0.6, // Minimum 60% of screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsGrid: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  dotContainer: {
    // Container for touchable dot - removed fixed size to allow dynamic sizing
  },
  dot: {
    // borderRadius is set dynamically in inline style (dotSize / 2 for perfect circle)
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDayInfo: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 5,
  },
  selectedDaySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#334155',
  },
  footer: {
    marginTop: 8,
    paddingTop: 12,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
  },
  autoUpdateContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  autoUpdateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoUpdateTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  autoUpdateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  autoUpdateSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  autoUpdateOptions: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  autoUpdateOptionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 10,
  },
  autoUpdateButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  autoUpdateButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  autoUpdateButtonActive: {
    backgroundColor: '#6366f1',
  },
  autoUpdateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  autoUpdateButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  autoUpdateWarning: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#7c2d12',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  autoUpdateWarningText: {
    fontSize: 12,
    color: '#fbbf24',
    lineHeight: 16,
  },
  autoUpdateIOSInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  autoUpdateIOSInfoText: {
    fontSize: 12,
    color: '#93c5fd',
    lineHeight: 16,
  },
  actionButtons: {
    marginTop: 15,
    gap: 10,
  },
  fullScreenButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
  },
  fullScreenButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  setWallpaperButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  setWallpaperButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Preview Modal Styles
  previewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewModalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  previewCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: height * 0.6,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
  },
  previewHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  previewCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  previewCancelText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  previewSetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  previewSetText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default YearCalendar;
