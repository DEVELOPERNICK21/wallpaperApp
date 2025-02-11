import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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

  return (
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
            onPress={() => setSelectedWallpaper(item.url)}>
            <Image source={{uri: item.url}} style={styles.wallpaper} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 10},
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  wallpaperContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  wallpaper: {width: '100%', height: 200, borderRadius: 10},
  selected: {borderWidth: 3, borderColor: 'blue'},
});

export default WallpaperScreen;
