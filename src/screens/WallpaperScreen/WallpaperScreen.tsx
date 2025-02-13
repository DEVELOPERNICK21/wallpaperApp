import React, {useState} from 'react';
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
} from 'react-native';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('window');

const wallpapers = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?q=80&w=2969&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1563387852576-964bc31b73af?q=80&w=3007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1512850183-6d7990f42385?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];
const WallpaperScreen = () => {
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [previewWallpaper, setPreviewWallpaper] = useState(null);
  const [loading, setLoading] = useState({});
  const fadeAnim = new Animated.Value(0);
  const scale = new Animated.Value(1);

  const handlePreview = url => {
    setPreviewWallpaper(url);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleImageLoad = id => {
    setLoading(prev => ({...prev, [id]: false}));
  };

  const onPinchGestureEvent = Animated.event([{nativeEvent: {scale}}], {
    useNativeDriver: true,
  });

  const onPinchHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <Text style={styles.header}>Choose a Wallpaper</Text>

        <FlatList
          data={wallpapers}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.wallpaperContainer,
                selectedWallpaper === item.url && styles.selected,
              ]}
              onPress={() => setSelectedWallpaper(item.url)}
              onLongPress={() => handlePreview(item.url)}>
              {loading[item.id] && (
                <ActivityIndicator
                  size="large"
                  color="limegreen"
                  style={styles.loader}
                />
              )}
              <Image
                source={{uri: item.url}}
                style={styles.wallpaper}
                onLoadStart={() =>
                  setLoading(prev => ({...prev, [item.id]: true}))
                }
                onLoad={() => handleImageLoad(item.id)}
              />
            </TouchableOpacity>
          )}
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
                  source={{uri: previewWallpaper}}
                  style={[styles.previewImage, {opacity: fadeAnim}]}
                />
              </Animated.View>
            </PinchGestureHandler>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setSelectedWallpaper(previewWallpaper);
                setPreviewWallpaper(null);
              }}>
              <Text style={styles.applyText}>Set Wallpaper</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closePreview}
              onPress={() => setPreviewWallpaper(null)}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Show applied wallpaper */}
        {selectedWallpaper && (
          <View style={styles.selectedWallpaperContainer}>
            <Text style={styles.appliedText}>Wallpaper Applied:</Text>
            <Image
              source={{uri: selectedWallpaper}}
              style={styles.selectedWallpaper}
            />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000', padding: 10},
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  wallpaperContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpaper: {width: '100%', height: 200, borderRadius: 15},
  selected: {borderWidth: 3, borderColor: 'limegreen'},
  loader: {
    position: 'absolute',
    zIndex: 1,
  },

  // Preview Styles
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width * 0.9,
    height: height * 0.8,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  closePreview: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  applyButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'limegreen',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  applyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Applied Wallpaper
  selectedWallpaperContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  appliedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedWallpaper: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default WallpaperScreen;
