import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import images from '../../assets/images';
import {height} from '../../assets/string.tsx';
import {color} from 'react-native-elements/dist/helpers/index';
import {colors} from '../../assets/color.js';

const {width} = Dimensions.get('window');

const imageData = [
  {uri: 'https://picsum.photos/200/300'},
  {uri: 'https://picsum.photos/200/300'},
  {uri: 'https://picsum.photos/200/300'},
  {uri: 'https://picsum.photos/200/300'},
];

const HomeImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= imageData.length) {
        nextIndex = 0;
      }
      sliderRef?.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    }, 3000); // Auto-play every 3 seconds

    return () => clearInterval(timer);
  }, [currentIndex]);

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderPaginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {imageData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 10, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, {width: dotWidth, opacity}]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={sliderRef}
        data={imageData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false, listener: onScroll},
        )}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => (
          <Image source={{uri: item?.uri}} style={styles.image} />
        )}
      />
      {renderPaginator()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height / 4,
    resizeMode: 'cover',
    padding: 30,
    borderRadius: 12,
  },
  paginatorContainer: {
    flexDirection: 'row',
    // position: 'absolute',
    // bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    height: 12,
    borderRadius: width,
    backgroundColor: colors?.primaryColor,
    marginHorizontal: 5,
  },
});

export default HomeImageSlider;
