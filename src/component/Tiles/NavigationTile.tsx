import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Platform, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../assets/color';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {
  ArrowRight_Icon,
  BlackNotificationBing_Icon,
  Notification_Icon,
} from '../../assets/icons/index.jsx';
import fonts from '../../assets/fonts/index.js';

interface Alert {
  id: number; // or string, depending on your data structure
  title: string; // example field
  name?: string; // optional field
  IconnTwo?: unknown; // optional field
  Icon?: unknown; // optional field
  // Add other fields as needed
}

interface NavigationTileProps {
  item: Alert;
}

const NavigationTile: React.FC<NavigationTileProps> = ({item}) => {
  return (
    <View style={styles.tileWrapper}>
      <View style={styles?.titleanndIcon}>
        <item.Icon height={width / 20} width={width / 20} />
        <Text style={styles?.textName}>{item?.title}</Text>
      </View>
      <item.IconnTwo height={width / 20} width={width / 20} />
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
