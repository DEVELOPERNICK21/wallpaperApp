import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
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
} from 'react-native';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import ManageWallpaper from 'react-native-manage-wallpaper';

const {width, height} = Dimensions.get('window');

interface Wallpaper {
  id: string;
  url: string;
  category: string;
  name: string;
}

const wallpapers: Wallpaper[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Nature',
    name: 'Mountain Sunset',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Abstract',
    name: 'Colorful Waves',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Nature',
    name: 'Forest Path',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1563387852576-964bc31b73af?q=80&w=3007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Urban',
    name: 'City Lights',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1512850183-6d7990f42385?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Abstract',
    name: 'Geometric',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Nature',
    name: 'Ocean View',
  },
];

const categories = ['All', 'Nature', 'Abstract', 'Urban'];

const WallpaperScreen = () => {
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, [headerAnim, slideAnim]);

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

      // Request permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download wallpapers.',
        );
        setDownloading(false);
        return;
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

        Alert.alert(
          'Download Complete! 📥',
          'Wallpaper has been saved to your gallery.',
          [{text: 'OK', style: 'default'}],
        );
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        'An error occurred while downloading the wallpaper. Please try again.',
      );
    } finally {
      setDownloading(false);
      setShowActionSheet(false);
    }
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

      // Download to temporary location
      const fileName = `temp_wallpaper_${Date.now()}.jpg`;
      const tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const result = await RNFS.downloadFile({
        fromUrl: url,
        toFile: tempPath,
      }).promise;

      if (result.statusCode === 200) {
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

        await ManageWallpaper.setWallpaper(
          {uri: `file://${tempPath}`},
          callback,
        );

        setSelectedWallpaper(url);
        Alert.alert(
          'Wallpaper Applied! 🎨',
          `Your ${
            type === 'both'
              ? 'home and lock screen'
              : type === 'home'
              ? 'home screen'
              : 'lock screen'
          } wallpaper has been set successfully.`,
          [{text: 'Awesome!', style: 'default'}],
        );

        // Clean up temp file
        setTimeout(() => {
          RNFS.unlink(tempPath).catch(err =>
            console.log('Error deleting temp file:', err),
          );
        }, 2000);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Apply wallpaper error:', error);
      Alert.alert(
        'Failed to Apply',
        'An error occurred while setting the wallpaper. Please try again.',
      );
    } finally {
      setApplying(false);
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
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImageLoad = (id: string) => {
    setLoading(prev => ({...prev, [id]: false}));
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
    selectedCategory === 'All'
      ? wallpapers
      : wallpapers.filter(w => w.category === selectedCategory);

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
          {loading[item.id] && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          )}

          <Image
            source={{uri: item.url}}
            style={styles.wallpaper}
            onLoadStart={() => setLoading(prev => ({...prev, [item.id]: true}))}
            onLoad={() => handleImageLoad(item.id)}
          />

          <View style={styles.wallpaperOverlay}>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorited && styles.favorited]}
              onPress={() => toggleFavorite(item.id)}>
              <Text style={styles.favoriteIcon}>
                {isFavorited ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>

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
          <Text style={styles.headerTitle}>Wallpapers</Text>
          <Text style={styles.headerSubtitle}>
            Choose your perfect background
          </Text>
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

        <FlatList
          data={filteredWallpapers}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={renderWallpaperItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

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
                <Animated.Image
                  source={{uri: previewWallpaper || ''}}
                  style={[styles.previewImage, {opacity: fadeAnim}]}
                />
              </Animated.View>
            </PinchGestureHandler>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setPreviewWallpaper(null);
                  if (previewWallpaper) {
                    openActionSheet(previewWallpaper);
                  }
                }}
                disabled={applying || downloading}>
                <Text style={styles.applyText}>
                  {applying ? 'Applying...' : 'Apply Wallpaper'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => {
                  if (previewWallpaper) {
                    downloadWallpaper(previewWallpaper);
                    setPreviewWallpaper(null);
                  }
                }}
                disabled={downloading || applying}>
                <Text style={styles.downloadText}>
                  {downloading ? 'Downloading...' : '📥 Download'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closePreview}
                onPress={() => setPreviewWallpaper(null)}>
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
                      style={styles.actionSheetButton}
                      onPress={() => {
                        if (actionSheetWallpaper) {
                          applyWallpaper(actionSheetWallpaper, 'home');
                        }
                      }}
                      disabled={applying || downloading}>
                      <View style={styles.actionSheetIcon}>
                        <Text style={styles.actionSheetIconText}>🏠</Text>
                      </View>
                      <View style={styles.actionSheetTextContainer}>
                        <Text style={styles.actionSheetButtonText}>
                          Set as Home Screen
                        </Text>
                        <Text style={styles.actionSheetButtonSubtext}>
                          Apply to home screen only
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionSheetButton}
                      onPress={() => {
                        if (actionSheetWallpaper) {
                          applyWallpaper(actionSheetWallpaper, 'lock');
                        }
                      }}
                      disabled={applying || downloading}>
                      <View style={styles.actionSheetIcon}>
                        <Text style={styles.actionSheetIconText}>🔒</Text>
                      </View>
                      <View style={styles.actionSheetTextContainer}>
                        <Text style={styles.actionSheetButtonText}>
                          Set as Lock Screen
                        </Text>
                        <Text style={styles.actionSheetButtonSubtext}>
                          Apply to lock screen only
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionSheetButton}
                      onPress={() => {
                        if (actionSheetWallpaper) {
                          applyWallpaper(actionSheetWallpaper, 'both');
                        }
                      }}
                      disabled={applying || downloading}>
                      <View style={styles.actionSheetIcon}>
                        <Text style={styles.actionSheetIconText}>📱</Text>
                      </View>
                      <View style={styles.actionSheetTextContainer}>
                        <Text style={styles.actionSheetButtonText}>
                          Set as Both
                        </Text>
                        <Text style={styles.actionSheetButtonSubtext}>
                          Apply to both home and lock screen
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionSheetButton,
                    styles.downloadActionButton,
                  ]}
                  onPress={() => {
                    if (actionSheetWallpaper) {
                      downloadWallpaper(actionSheetWallpaper);
                    }
                  }}
                  disabled={applying || downloading}>
                  <View style={styles.actionSheetIcon}>
                    <Text style={styles.actionSheetIconText}>📥</Text>
                  </View>
                  <View style={styles.actionSheetTextContainer}>
                    <Text style={styles.actionSheetButtonText}>
                      Download to Gallery
                    </Text>
                    <Text style={styles.actionSheetButtonSubtext}>
                      Save to your photo gallery
                    </Text>
                  </View>
                </TouchableOpacity>

                {applying && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#6366f1" />
                    <Text style={styles.loadingText}>
                      Applying wallpaper...
                    </Text>
                  </View>
                )}

                {downloading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#10b981" />
                    <Text style={styles.loadingText}>Downloading...</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

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
    padding: 15,
  },
  favoriteButton: {
    alignSelf: 'flex-end',
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
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  applyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closePreview: {
    backgroundColor: 'rgba(239,68,68,0.8)',
    padding: 15,
    borderRadius: 25,
    elevation: 5,
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
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  downloadActionButton: {
    backgroundColor: '#10b981',
    marginTop: 10,
  },
  actionSheetIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionSheetIconText: {
    fontSize: 24,
  },
  actionSheetTextContainer: {
    flex: 1,
  },
  actionSheetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  actionSheetButtonSubtext: {
    fontSize: 12,
    color: '#94a3b8',
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
});

export default WallpaperScreen;
