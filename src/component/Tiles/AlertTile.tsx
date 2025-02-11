import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Platform, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar.jsx';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  Airplane_Icon,
  ArrowWhite_Icon,
  Calendar_Icon,
  CalendarTwo_Icon,
  Chevron_Icon,
  DocumentText_Icon,
  DollarVector_Icon,
  Note_Icon,
  Profile_Icon,
  ProfileTwo_Icon,
} from '../../assets/icons/index.jsx';
import fonts from '../../assets/fonts/index.js';

interface Alert {
  id: number; // or string, depending on your data structure
  title: string; // example field
  name?: string; // optional field
  start?: string; // optional field
  end?: string; // optional field
  // Add other fields as needed
}

interface AlertTileProps {
  item: Alert;
}

const AlertTile: React.FC<AlertTileProps> = ({item}) => {
  return (
    <View style={styles.tileWrapper}>
      <View style={styles?.firstArea}>
        <View style={styles?.imageWithText}>
          <View style={styles?.arrowCircle} />
          <View style={styles?.twoText}>
            <Text style={styles?.textName}>{item?.title}</Text>
            <Text>Assign by: {item?.name}</Text>
          </View>
        </View>
        <Text style={styles?.timeText}>March 06,2024</Text>
      </View>
      <View style={styles?.secondArea}>
        <Text style={styles?.textDown}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    backgroundColor: colors?.greyColorMostLight,
    marginHorizontal: width / 20,
    marginVertical: 10,
    padding: width / 30,
    borderRadius: 12,
    shadowColor: colors?.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: Platform.OS === 'android' ? 0.2 : 0.2,
    shadowRadius: 20,
    elevation: 50,
  },
  arrowCircle: {
    backgroundColor: colors?.greyColor,
    borderRadius: width,
    width: width / 10,
    height: width / 10,
  },
  firstArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageWithText: {
    flexDirection: 'row',
    width: '60%',
    alignItems: 'center',
  },
  secondArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    alignItems: 'center',
  },
  twoText: {
    paddingHorizontal: 10,
  },
  textDown: {
    fontSize: 10,
    fontFamily: fonts?.PoppinsRegular,
    marginVertical: 10,
    color: colors?.greyNew,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts?.PoppinsRegular,
    marginVertical: 10,
    color: colors?.black,
  },
  textName: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsSemiBold,
  },
});

export default AlertTile;
