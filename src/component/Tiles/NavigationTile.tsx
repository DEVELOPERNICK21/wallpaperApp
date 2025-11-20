import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../assets/color';
import {width} from '../../assets/string.tsx';
import fonts from '../../assets/fonts/index.js';

interface Alert {
  id: number; // or string, depending on your data structure
  title: string; // example field
  name?: string; // optional field
  IconnTwo?: unknown; // optional field
  Icon?: unknown; // optional field
  onPress?: () => void;
  // Add other fields as needed
}

interface NavigationTileProps {
  item: Alert;
}

const NavigationTile: React.FC<NavigationTileProps> = ({item}) => {
  const Content = () => (
    <>
      <View style={styles?.titleanndIcon}>
        {item?.Icon ? (
          <item.Icon height={width / 20} width={width / 20} />
        ) : null}
        <Text style={styles?.textName}>{item?.title}</Text>
      </View>
      {item?.IconnTwo ? (
        <item.IconnTwo height={width / 20} width={width / 20} />
      ) : null}
    </>
  );

  if (item?.onPress) {
    return (
      <TouchableOpacity
        style={styles.tileWrapper}
        onPress={item.onPress}
        activeOpacity={0.8}>
        <Content />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.tileWrapper}>
      <Content />
    </View>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    marginHorizontal: width / 20,
    marginVertical: 10,
    padding: width / 25,
    borderBottomColor: colors?.greyColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleanndIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textName: {
    fontSize: 18,
    fontFamily: fonts?.PoppinsRegular,
    paddingHorizontal: 20,
  },
});

export default NavigationTile;
