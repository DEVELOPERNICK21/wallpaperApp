import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
} from 'react-native';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  setHomeWallpaper,
  setLockWallpaper,
  isWallpaperSupported,
  testWithStaticImage,
} from '../../utils/WallpaperManager';
import WallHavenService, {
  WallHavenWallpaper,
  WallHavenSearchParams,
} from '../../services/WallHavenService';
import {useDispatch} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {requestChatAccess} from '../../redux/actions/appState';
import DynamicIslandSettingsContent from '../../component/DynamicIslandSettingsContent/DynamicIslandSettingsContent';
import {getAndClearPendingNavigateToPet} from '../../utils/deepLinkPet';
import ScreenConstants from '../../Routes/ScreenConstants';

const {width, height} = Dimensions.get('window');

interface Wallpaper {
  id: string;
  url: string;
  category: string;
  name: string;
  thumbnail?: string; // For grid display
}

const categories = ['Year Calculator', 'All', 'General', 'Anime', 'People'];

const WallpaperScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Deep link from Dynamic Island (wallpe://pet): navigate to Pet screen when stack is ready or when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      if (getAndClearPendingNavigateToPet()) {
        navigation.navigate(ScreenConstants.PET_SCREEN as never);
      }
    }, [navigation]),
  );
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(
    null,
  );
  const [previewWallpaper, setPreviewWallpaper] = useState<string | null>(null);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFavorite, setIsFavorite] = useState<{[key: string]: boolean}>({});
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionSheetWallpaper, setActionSheetWallpaper] = useState<
    string | null
  >(null);
  const [downloading, setDownloading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyingProgress, setApplyingProgress] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [previewImageError, setPreviewImageError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // WallHaven API states
  const [loadingWallpapers, setLoadingWallpapers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Convert WallHaven wallpaper to app format
  const convertWallHavenToWallpaper = (wh: WallHavenWallpaper): Wallpaper => {
    // Use first tag as name, or fallback to category
    const name = wh.tags && wh.tags.length > 0 
      ? wh.tags[0].name.charAt(0).toUpperCase() + wh.tags[0].name.slice(1)
      : wh.category.charAt(0).toUpperCase() + wh.category.slice(1);
    
    return {
      id: wh.id,
      url: wh.path, // Full resolution image
      thumbnail: wh.thumbs.large, // Thumbnail for grid
      category: wh.category.charAt(0).toUpperCase() + wh.category.slice(1),
      name: name,
    };
  };

  // Fetch wallpapers from WallHaven API
  const fetchWallpapers = async (page: number = 1, reset: boolean = false) => {
    try {
      setLoadingWallpapers(true);
      setError(null);

      const params: WallHavenSearchParams = {
        page,
        sorting: 'date_added',
        order: 'desc',
        purity: '100', // SFW only
        atleast: '1920x1080', // Minimum resolution
      };

      // Handle category filter
      if (selectedCategory === 'General') {
        params.categories = '100'; // general only
      } else if (selectedCategory === 'Anime') {
        params.categories = '010'; // anime only
      } else if (selectedCategory === 'People') {
        params.categories = '001'; // people only
      } else if (selectedCategory === 'All') {
        params.categories = '111'; // all categories
      }

      // Add search query if provided
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const response = await WallHavenService.search(params);
      
      const convertedWallpapers = response.data.map(convertWallHavenToWallpaper);
      
      if (reset) {
        setWallpapers(convertedWallpapers);
      } else {
        setWallpapers(prev => [...prev, ...convertedWallpapers]);
      }

      setHasMore(page < response.meta.last_page);
      setCurrentPage(page);
      
      console.log(`✅ Loaded ${convertedWallpapers.length} wallpapers (Page ${page}/${response.meta.last_page})`);
    } catch (err: any) {
      console.error('❌ Error fetching wallpapers:', err);
      setError(err.message || 'Failed to load wallpapers');
      
      // Show error alert
      Alert.alert(
        'Error Loading Wallpapers',
        err.message || 'Failed to fetch wallpapers. Please check your internet connection and try again.',
        [{text: 'OK'}]
      );
    } finally {
      setLoadingWallpapers(false);
    }
  };

  // Load more wallpapers (pagination)
  const loadMoreWallpapers = () => {
    if (!loadingWallpapers && hasMore) {
      fetchWallpapers(currentPage + 1, false);
    }
  };

  useEffect(() => {
    console.log('📱 WallpaperScreen mounted');
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Load initial wallpapers
    fetchWallpapers(1, true);
  }, []);

  // Reload when category changes (skip for Year Calculator - no wallpapers)
  useEffect(() => {
    setSearchQuery(''); // Reset search when category changes
    if (selectedCategory === 'Year Calculator') {
      return;
    }
    fetchWallpapers(1, true);
  }, [selectedCategory]);

  // Request Storage Permission (Android)
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 33) {
        // Android 13+ uses granular permissions
        const readPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        return readPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message:
              'This app needs access to your storage to download wallpapers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      return false;
    }
  };

  // Download Wallpaper
  const downloadWallpaper = async (url: string) => {
    try {
      setDownloading(true);

      // Request permission (Android only)
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Storage permission is needed to save wallpapers to your gallery. Please grant permission in Settings.',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Grant Permission',
                onPress: async () => {
                  const granted = await requestStoragePermission();
                  if (granted) {
                    downloadWallpaper(url);
                  }
                },
              },
            ],
          );
          setDownloading(false);
          return;
        }
      }

      // Create file path
      const fileName = `Wallpaper_${Date.now()}.jpg`;
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Download file
      const result = await RNFS.downloadFile({
        fromUrl: url,
        toFile: downloadDest,
      }).promise;

      if (result.statusCode === 200) {
        // Save to gallery
        await CameraRoll.save(downloadDest, {type: 'photo'});

        // Show success toast
        showSuccessToastMessage('Wallpaper saved to gallery! 📥');
      } else {
        throw new Error(
          `Download failed with status code: ${result.statusCode}`,
        );
      }
    } catch (error: any) {
      console.error('Download error:', error);

      let errorMessage = 'An error occurred while downloading the wallpaper.';
      if (error?.message) {
        if (error.message.includes('permission')) {
          errorMessage =
            'Storage permission is required. Please grant it in Settings.';
        } else if (
          error.message.includes('network') ||
          error.message.includes('connection')
        ) {
          errorMessage =
            'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Download Failed', errorMessage);
    } finally {
      setDownloading(false);
      setShowActionSheet(false);
    }
  };

  // Show success toast notification
  const showSuccessToastMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);

    // Animate toast in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide toast after 3 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessToast(false);
      });
    }, 3000);
  };

  // Apply Wallpaper (Android Only)
  const applyWallpaper = async (
    url: string,
    type: 'home' | 'lock' | 'both',
  ) => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'iOS Limitation',
        'iOS does not allow apps to set wallpapers programmatically. Please download the image and set it manually from Settings > Wallpaper.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Download Instead',
            onPress: () => downloadWallpaper(url),
          },
        ],
      );
      return;
    }

    try {
      setApplying(true);
      setApplyingProgress('Downloading wallpaper...');

      // Download to temporary location
      const fileName = `temp_wallpaper_${Date.now()}.jpg`;
      const tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const result = await RNFS.downloadFile({
        fromUrl: url,
        toFile: tempPath,
      }).promise;

      if (result.statusCode === 200) {
        setApplyingProgress('Processing image...');

        // Small delay to show processing state
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if wallpaper is supported
        if (!isWallpaperSupported()) {
          throw new Error('Wallpaper feature is not available on this device.');
        }

        setApplyingProgress('Applying wallpaper...');

        // Set wallpaper based on selected type
        let homeSuccess = false;
        let lockSuccess = false;
        let toastMessage = '';
        let errorMessage = '';

        if (type === 'home') {
          homeSuccess = await setHomeWallpaper(`file://${tempPath}`);
          if (homeSuccess) {
            toastMessage = 'Wallpaper applied to home screen! 🏠';
          } else {
            errorMessage =
              'Failed to set wallpaper on home screen. This may be due to device restrictions.';
          }
        } else if (type === 'lock') {
          lockSuccess = await setLockWallpaper(`file://${tempPath}`);
          if (lockSuccess) {
            toastMessage = 'Wallpaper applied to lock screen! 🔒';
          } else {
            errorMessage =
              'Failed to set wallpaper on lock screen. Many devices block lock screen wallpaper changes due to OEM restrictions. Try setting home screen only instead.';
          }
        } else if (type === 'both') {
          // Try to set both screens separately to get better error reporting
          homeSuccess = await setHomeWallpaper(`file://${tempPath}`);
          lockSuccess = await setLockWallpaper(`file://${tempPath}`);

          if (homeSuccess && lockSuccess) {
            toastMessage = 'Wallpaper applied to both screens! 📱';
          } else if (homeSuccess && !lockSuccess) {
            toastMessage = 'Wallpaper applied to home screen! 🏠';
            errorMessage =
              'Lock screen failed: Many devices block lock screen wallpaper changes. Home screen was set successfully.';
          } else if (!homeSuccess && lockSuccess) {
            toastMessage = 'Wallpaper applied to lock screen! 🔒';
            errorMessage =
              'Home screen failed: Could not set wallpaper on home screen. Lock screen was set successfully.';
          } else {
            errorMessage =
              'Failed to set wallpaper on both screens. This may be due to device restrictions or missing permissions.';
          }
        }

        // Show success toast if at least one screen was set
        if (homeSuccess || lockSuccess) {
          setSelectedWallpaper(url);
          showSuccessToastMessage(toastMessage);

          // Ensure images remain visible after applying - reset any error states
          // This prevents the black screen issue
          const appliedWallpaper = wallpapers.find(w => w.url === url);
          if (appliedWallpaper) {
            // Clear any error state for this wallpaper
            setImageErrors(prev => {
              const updated = {...prev};
              delete updated[appliedWallpaper.id];
              return updated;
            });
            // Ensure loading state is cleared
            setLoading(prev => {
              const updated = {...prev};
              updated[appliedWallpaper.id] = false;
              return updated;
            });
          }

          // Show warning if partial success (both selected but one failed)
          if (type === 'both' && (!homeSuccess || !lockSuccess)) {
            setTimeout(() => {
              Alert.alert('Partial Success', errorMessage, [
                {text: 'OK', style: 'default'},
              ]);
            }, 1000);
          }
        } else {
          // Complete failure - show error
          throw new Error(
            errorMessage ||
              'Failed to set wallpaper. This may be due to device restrictions.',
          );
        }

        // Clean up temp file
        setTimeout(() => {
          RNFS.unlink(tempPath).catch(err =>
            console.log('Error deleting temp file:', err),
          );
        }, 2000);
      } else {
        throw new Error(
          `Download failed with status code: ${result.statusCode}`,
        );
      }
    } catch (error: any) {
      console.error('Apply wallpaper error:', error);

      let errorMessage = 'An error occurred while setting the wallpaper.';
      let errorTitle = 'Failed to Apply';

      if (error?.message) {
        if (error.message.includes('permission')) {
          errorTitle = 'Permission Required';
          errorMessage =
            'The app needs wallpaper permission. Please grant it in Settings > Apps > This App > Permissions.';
        } else if (
          error.message.includes('not available') ||
          error.message.includes('not properly linked')
        ) {
          errorTitle = 'Feature Unavailable';
          errorMessage =
            'Wallpaper feature is not available. Please restart the app or reinstall if the issue persists.';
        } else if (error.message.includes('Download failed')) {
          errorTitle = 'Download Failed';
          errorMessage =
            'Could not download the wallpaper. Please check your internet connection and try again.';
        } else if (error.message.includes('lock screen')) {
          errorTitle = 'Lock Screen Not Supported';
          errorMessage = error.message;
        } else if (error.message.includes('home screen')) {
          errorTitle = 'Home Screen Failed';
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert(errorTitle, errorMessage, [
        {text: 'OK', style: 'default'},
        ...(errorTitle === 'Permission Required'
          ? [
              {
                text: 'Open Settings',
                onPress: () => {
                  // On Android, you could open app settings here
                  console.log('Open settings');
                },
              },
            ]
          : []),
      ]);
    } finally {
      setApplying(false);
      setApplyingProgress('');
      setShowActionSheet(false);
    }
  };

  // Open Action Sheet
  const openActionSheet = (url: string) => {
    setActionSheetWallpaper(url);
    setShowActionSheet(true);
  };

  const handlePreview = (url: string) => {
    setPreviewWallpaper(url);
    setPreviewImageError(false);
    setPreviewLoading(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImageLoad = (id: string) => {
    console.log(`✅ Image loaded successfully for wallpaper ${id}`);
    setLoading(prev => ({...prev, [id]: false}));
    setImageErrors(prev => ({...prev, [id]: false}));
  };

  const handleImageError = (id: string, error: any) => {
    const wallpaper = wallpapers.find(w => w.id === id);
    console.error(`❌ Image load error for wallpaper ${id}:`, {
      error,
      url: wallpaper?.url,
      errorMessage: error?.nativeEvent?.error || error?.message,
    });
    setLoading(prev => ({...prev, [id]: false}));
    setImageErrors(prev => ({...prev, [id]: true}));
  };

  const toggleFavorite = (id: string) => {
    setIsFavorite(prev => ({...prev, [id]: !prev[id]}));
  };

  const onPinchGestureEvent = Animated.event([{nativeEvent: {scale}}], {
    useNativeDriver: true,
  });

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const filteredWallpapers =
    selectedCategory === 'Year Calculator'
      ? [] // Show Year Calculator content instead
      : wallpapers; // Already filtered by API based on category

  const renderWallpaperItem = ({item}: {item: Wallpaper; index: number}) => {
    const isSelected = selectedWallpaper === item.url;
    const isFavorited = isFavorite[item.id];

    return (
      <Animated.View
        style={[
          styles.wallpaperItem,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}>
        <TouchableOpacity
          style={[styles.wallpaperContainer, isSelected && styles.selected]}
          onPress={() => setSelectedWallpaper(item.url)}
          onLongPress={() => handlePreview(item.url)}
          activeOpacity={0.8}>
          {loading[item.id] && !imageErrors[item.id] && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          )}

          {imageErrors[item.id] ? (
            <View style={[styles.wallpaper, styles.errorContainer]}>
              <Text style={styles.errorIcon}>🖼️</Text>
              <Text style={styles.errorText}>Failed to load</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setImageErrors(prev => ({...prev, [item.id]: false}));
                  setLoading(prev => ({...prev, [item.id]: true}));
                }}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Image
              key={`wallpaper-${item.id}-${
                selectedWallpaper === item.url ? 'selected' : 'normal'
              }`}
              source={{uri: item.thumbnail || item.url}}
              style={styles.wallpaper}
              resizeMode="cover"
              onLoadStart={() => {
                console.log(
                  `🔄 Starting to load image for wallpaper ${item.id}: ${item.url}`,
                );
                setLoading(prev => ({...prev, [item.id]: true}));
              }}
              onLoad={() => handleImageLoad(item.id)}
              onError={error => handleImageError(item.id, error)}
            />
          )}

          <View style={styles.wallpaperOverlay}>
            <View style={styles.wallpaperTopActions}>
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  (applying || downloading) && styles.buttonDisabled,
                ]}
                onPress={e => {
                  e.stopPropagation();
                  if (Platform.OS === 'android') {
                    openActionSheet(item.url);
                  } else {
                    Alert.alert(
                      'iOS Limitation',
                      'iOS does not allow apps to set wallpapers programmatically. Please download the image and set it manually.',
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Download',
                          onPress: () => downloadWallpaper(item.url),
                        },
                      ],
                    );
                  }
                }}
                disabled={applying || downloading}
                activeOpacity={0.7}>
                <Text style={styles.quickActionIcon}>🎨</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.favoriteButton, isFavorited && styles.favorited]}
                onPress={e => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                activeOpacity={0.7}>
                <Text style={styles.favoriteIcon}>
                  {isFavorited ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wallpaperInfo}>
              <Text style={styles.wallpaperName}>{item.name}</Text>
              <Text style={styles.wallpaperCategory}>{item.category}</Text>
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
              opacity: headerAnim,
            },
          ]}>
          <View style={styles.headerTopRow}>
            <Pressable
              onLongPress={() => dispatch(requestChatAccess())}
              delayLongPress={600}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              style={styles.headerTitleTouchable}>
              <Text style={styles.headerTitle}>Wallpapers</Text>
              <Text style={styles.headerSubtitle}>
                Choose your perfect background
              </Text>
            </Pressable>
            <View style={styles.headerActions}>
              {Platform.OS === 'android' && __DEV__ && (
                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={() => {
                    Alert.alert(
                      'Diagnostic Test',
                      'Test wallpaper with static image?\n\nPlace test.jpg in /sdcard/Download/ first.',
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Run Test',
                          onPress: () => testWithStaticImage(),
                        },
                      ],
                    );
                  }}>
                  <Text style={styles.debugButtonText}>🧪</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category, _index) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.selectedCategoryText,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedCategory === 'Year Calculator' ? (
          <View style={styles.yearCalculatorWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.yearCalculatorContainer}>
              <DynamicIslandSettingsContent darkTheme />
            </ScrollView>
          </View>
        ) : (
          <>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search wallpapers..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    fetchWallpapers(1, true);
                  }
                }}
                returnKeyType="search"
              />
              {searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchQuery('');
                    fetchWallpapers(1, true);
                  }}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingWallpapers && wallpapers.length === 0 ? (
              <View style={styles.initialLoadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading wallpapers...</Text>
              </View>
            ) : error && wallpapers.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchWallpapers(1, true)}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
              data={filteredWallpapers}
              keyExtractor={item => item.id}
              numColumns={2}
              renderItem={renderWallpaperItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              onEndReached={loadMoreWallpapers}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingWallpapers ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Loading more...</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !loadingWallpapers ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No wallpapers found</Text>
                    <Text style={styles.emptySubtext}>
                      Try a different search or category
                    </Text>
                  </View>
                ) : null
              }
              />
            )}
          </>
        )}

        {/* Preview Modal */}
        <Modal
          visible={!!previewWallpaper}
          transparent={true}
          animationType="fade">
          <View style={styles.previewContainer}>
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchHandlerStateChange}>
              <Animated.View style={{transform: [{scale}]}}>
                {previewImageError ? (
                  <View
                    style={[styles.previewImage, styles.previewErrorContainer]}>
                    <Text style={styles.previewErrorIcon}>🖼️</Text>
                    <Text style={styles.previewErrorText}>
                      Failed to load image
                    </Text>
                    <TouchableOpacity
                      style={styles.previewRetryButton}
                      onPress={() => {
                        setPreviewImageError(false);
                        setPreviewLoading(true);
                      }}>
                      <Text style={styles.previewRetryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {previewLoading && (
                      <View style={styles.previewLoaderContainer}>
                        <ActivityIndicator size="large" color="#6366f1" />
                      </View>
                    )}
                    <Animated.Image
                      source={{uri: previewWallpaper || ''}}
                      style={[styles.previewImage, {opacity: fadeAnim}]}
                      resizeMode="contain"
                      onLoadStart={() => setPreviewLoading(true)}
                      onLoad={() => setPreviewLoading(false)}
                      onError={error => {
                        console.error('Preview image error:', error);
                        setPreviewImageError(true);
                        setPreviewLoading(false);
                      }}
                    />
                  </>
                )}
              </Animated.View>
            </PinchGestureHandler>

            <View style={styles.previewActions}>
              <View style={styles.previewActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    (applying || downloading) && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    setPreviewWallpaper(null);
                    if (previewWallpaper) {
                      openActionSheet(previewWallpaper);
                    }
                  }}
                  disabled={applying || downloading}
                  activeOpacity={0.8}>
                  <View style={styles.buttonContent}>
                    {!applying && <Text style={styles.buttonIcon}>🎨</Text>}
                    {applying ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                        style={styles.buttonLoader}
                      />
                    ) : null}
                    <Text style={styles.applyText}>
                      {applying
                        ? applyingProgress || 'Applying...'
                        : 'Set as Wallpaper'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.downloadButton,
                    (downloading || applying) && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (previewWallpaper) {
                      downloadWallpaper(previewWallpaper);
                      setPreviewWallpaper(null);
                    }
                  }}
                  disabled={downloading || applying}
                  activeOpacity={0.8}>
                  <View style={styles.buttonContent}>
                    {!downloading && <Text style={styles.buttonIcon}>📥</Text>}
                    {downloading ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                        style={styles.buttonLoader}
                      />
                    ) : null}
                    <Text style={styles.downloadText}>
                      {downloading ? 'Downloading...' : 'Save'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closePreview}
                onPress={() => setPreviewWallpaper(null)}
                activeOpacity={0.7}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Action Sheet Modal */}
        <Modal
          visible={showActionSheet}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowActionSheet(false)}>
          <View style={styles.actionSheetOverlay}>
            <TouchableOpacity
              style={styles.actionSheetBackdrop}
              activeOpacity={1}
              onPress={() => setShowActionSheet(false)}
            />
            <View style={styles.actionSheetContainer}>
              <View style={styles.actionSheetHeader}>
                <Text style={styles.actionSheetTitle}>
                  Choose Wallpaper Option
                </Text>
                <TouchableOpacity
                  onPress={() => setShowActionSheet(false)}
                  style={styles.closeActionSheet}>
                  <Text style={styles.closeActionSheetText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionSheetOptions}>
                {Platform.OS === 'android' && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.actionSheetButton,
                        styles.actionSheetButtonPrimary,
                        (applying || downloading) && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        if (actionSheetWallpaper) {
                          applyWallpaper(actionSheetWallpaper, 'home');
                        }
                      }}
                      disabled={applying || downloading}
                      activeOpacity={0.7}>
                      <View style={styles.actionSheetIconPrimary}>
                        <Text style={styles.actionSheetIconText}>🏠</Text>
                      </View>
                      <View style={styles.actionSheetTextContainer}>
                        <Text style={styles.actionSheetButtonTextPrimary}>
                          Set as Home Screen Wallpaper
                        </Text>
                        <Text style={styles.actionSheetButtonSubtextPrimary}>
                          Apply to home screen only
                        </Text>
                      </View>
                      <Text style={styles.actionSheetArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionSheetButton,
                        styles.actionSheetButtonSecondary,
                        (applying || downloading) && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        if (actionSheetWallpaper) {
                          applyWallpaper(actionSheetWallpaper, 'lock');
                        }
                      }}
                      disabled={applying || downloading}
                      activeOpacity={0.7}>
                      <View style={styles.actionSheetIconSecondary}>
                        <Text style={styles.actionSheetIconText}>🔒</Text>
                      </View>
                      <View style={styles.actionSheetTextContainer}>
                        <Text style={styles.actionSheetButtonTextSecondary}>
                          Set as Lock Screen Wallpaper
                        </Text>
                        <Text style={styles.actionSheetButtonSubtextSecondary}>
                          Apply to lock screen only
                        </Text>
                      </View>
                      <Text style={styles.actionSheetArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionSheetButton,
                        styles.actionSheetButtonTertiary,
                        (applying || downloading) && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        if (actionSheetWallpaper) {
                          applyWallpaper(actionSheetWallpaper, 'both');
                        }
                      }}
                      disabled={applying || downloading}
                      activeOpacity={0.7}>
                      <View style={styles.actionSheetIconTertiary}>
                        <Text style={styles.actionSheetIconText}>📱</Text>
                      </View>
                      <View style={styles.actionSheetTextContainer}>
                        <Text style={styles.actionSheetButtonTextTertiary}>
                          Set as Both Screens Wallpaper
                        </Text>
                        <Text style={styles.actionSheetButtonSubtextTertiary}>
                          Apply to both home and lock screen
                        </Text>
                      </View>
                      <Text style={styles.actionSheetArrow}>→</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionSheetButton,
                    styles.downloadActionButton,
                    (applying || downloading) && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (actionSheetWallpaper) {
                      downloadWallpaper(actionSheetWallpaper);
                    }
                  }}
                  disabled={applying || downloading}
                  activeOpacity={0.7}>
                  <View style={styles.actionSheetIcon}>
                    <Text style={styles.actionSheetIconText}>📥</Text>
                  </View>
                  <View style={styles.actionSheetTextContainer}>
                    <Text style={styles.actionSheetButtonText}>
                      Save to Gallery
                    </Text>
                    <Text style={styles.actionSheetButtonSubtext}>
                      Download to your photo gallery
                    </Text>
                  </View>
                </TouchableOpacity>

                {applying && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#6366f1" />
                    <Text style={styles.loadingText}>
                      {applyingProgress || 'Applying wallpaper...'}
                    </Text>
                  </View>
                )}

                {downloading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#10b981" />
                    <Text style={styles.loadingText}>
                      Downloading wallpaper...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Success Toast Notification */}
        {showSuccessToast && (
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.toastContent}>
              <Text style={styles.toastText}>{successMessage}</Text>
            </View>
          </Animated.View>
        )}

        {/* Selected Wallpaper Preview */}
        {selectedWallpaper && (
          <Animated.View
            style={[
              styles.selectedWallpaperContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.selectedWallpaperContent}>
              <Text style={styles.appliedText}>Current Wallpaper</Text>
              <Image
                source={{uri: selectedWallpaper}}
                style={styles.selectedWallpaper}
              />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setSelectedWallpaper(null)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  headerTitleTouchable: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dynamicIslandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#06b6d4',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dynamicIslandButtonText: {
    fontSize: 18,
  },
  debugButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  debugButtonText: {
    fontSize: 18,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedCategory: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  calendarContainer: {
    paddingBottom: 100,
  },
  calendarWrapper: {
    flex: 1,
  },
  yearCalculatorWrapper: {
    flex: 1,
  },
  yearCalculatorContainer: {
    paddingBottom: 100,
  },
  wallpaperItem: {
    flex: 1,
    margin: 5,
  },
  wallpaperContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  wallpaper: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#6366f1',
    transform: [{scale: 1.02}],
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    zIndex: 1,
  },
  wallpaperOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 12,
  },
  wallpaperTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  quickActionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  quickActionIcon: {
    fontSize: 18,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favorited: {
    backgroundColor: 'rgba(239,68,68,0.8)',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  wallpaperInfo: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  wallpaperName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  wallpaperCategory: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#6366f1',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width * 0.9,
    height: height * 0.7,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  previewActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    minHeight: 56,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    fontSize: 20,
  },
  applyText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#475569',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closePreview: {
    backgroundColor: 'rgba(239,68,68,0.9)',
    padding: 12,
    borderRadius: 20,
    elevation: 5,
    alignSelf: 'center',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Action Sheet Styles
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  actionSheetBackdrop: {
    flex: 1,
  },
  actionSheetContainer: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  closeActionSheet: {
    backgroundColor: '#ef4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeActionSheetText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionSheetOptions: {
    paddingTop: 20,
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
    elevation: 2,
  },
  actionSheetButtonPrimary: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
    marginBottom: 12,
    padding: 20,
  },
  actionSheetButtonSecondary: {
    backgroundColor: '#8b5cf6',
    borderColor: '#a78bfa',
    marginBottom: 12,
    padding: 20,
  },
  actionSheetButtonTertiary: {
    backgroundColor: '#ec4899',
    borderColor: '#f472b6',
    marginBottom: 16,
    padding: 20,
  },
  downloadActionButton: {
    backgroundColor: '#10b981',
    marginTop: 10,
    borderColor: '#34d399',
  },
  actionSheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionSheetIconPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#818cf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionSheetIconSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a78bfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionSheetIconTertiary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f472b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionSheetIconText: {
    fontSize: 26,
  },
  actionSheetTextContainer: {
    flex: 1,
  },
  actionSheetButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  actionSheetButtonTextPrimary: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  actionSheetButtonTextSecondary: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  actionSheetButtonTextTertiary: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  actionSheetButtonSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  actionSheetButtonSubtextPrimary: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
  },
  actionSheetButtonSubtextSecondary: {
    fontSize: 14,
    color: '#ede9fe',
    lineHeight: 20,
  },
  actionSheetButtonSubtextTertiary: {
    fontSize: 14,
    color: '#fce7f3',
    lineHeight: 20,
  },
  actionSheetArrow: {
    fontSize: 24,
    color: '#ffffff',
    marginLeft: 'auto',
    fontWeight: '300',
  },
  actionSheetDivider: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  selectedWallpaperContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(30,41,59,0.95)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedWallpaperContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appliedText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  selectedWallpaper: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginHorizontal: 15,
  },
  changeButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  changeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Toast Notification Styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContent: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonLoader: {
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop: 10,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearSearchButton: {
    padding: 5,
    marginLeft: 10,
  },
  clearSearchText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 10,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 14,
  },
  initialLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  previewLoaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  previewErrorContainer: {
    backgroundColor: 'rgba(30,41,59,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  previewErrorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  previewErrorText: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  previewRetryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  previewRetryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WallpaperScreen;
