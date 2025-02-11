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

interface Task {
  id: number; // or string, depending on your data structure
  title: string; // example field
  name?: string; // optional field
  start?: string; // optional field
  end?: string; // optional field
  // Add other fields as needed
}

interface TaskTileProps {
  item: Task;
}

const TaskTile: React.FC<TaskTileProps> = ({item}) => {
  return (
    <View style={styles.tileWrapper}>
      <Text style={styles?.textName}>{item?.title}</Text>
      <View style={styles?.secondArea}>
        <Text>Lead: {item?.name}</Text>
        <View style={styles?.arrowCircle}>
          <Chevron_Icon height={width / 22} width={width / 22} />
        </View>
      </View>
      <View style={styles?.thirdArea}>
        <View style={styles?.rowArea}>
          <Calendar_Icon height={width / 22} width={width / 22} />
          <Text style={styles?.textDown}>Start: {item?.start}</Text>
        </View>
        <Text style={styles?.textDown}>Deadline: {item?.end}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    backgroundColor: colors?.greyColorMostLight,
    // backgroundColor: 'red',
    marginHorizontal: width / 15,
    marginVertical: 10,
    padding: width / 30,
    borderRadius: 12,
    // height: height / 8,
  },
  arrowCircle: {
    backgroundColor: colors?.primaryColor,
    borderRadius: width,
    padding: 10,
  },
  secondArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    alignItems: 'center',
  },
  thirdArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  rowArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textDown: {
    fontSize: 10,
    fontFamily: fonts?.PoppinsRegular,
    paddingHorizontal: 10,
  },
  textName: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsSemiBold,
  },
});

export default TaskTile;
