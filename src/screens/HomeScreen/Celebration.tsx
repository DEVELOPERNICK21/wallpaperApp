import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Platform, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar.jsx';
import {width} from '../../assets/string.tsx';

import fonts from '../../assets/fonts/index.js';
import CustomSmallButton from '../../component/Buttons/CustomSmallButton.tsx';

interface Task {
  id: number; // or string, depending on your data structure
  title: string; // example field
  name?: string; // optional field
  department?: string; // optional field
  // Add other fields as needed
}

interface CelebrationProps {
  item: Task;
}

let loginButtonData = {
  buttonTitle: 'Send A Wish',
};

const Celebration: React.FC<CelebrationProps> = ({item}) => {
  return (
    <View style={styles.tileWrapper}>
      <Text style={styles?.textName}>{item?.name}</Text>
      <View style={styles?.thirdArea}>
        <View style={styles?.rowArea}>
          <Text style={styles?.textTitle}>{item?.title}</Text>
        </View>
      </View>
      <View style={styles?.secondArea}>
        <Text style={styles?.textDown}>Department: {item?.department}</Text>
        <CustomSmallButton
          buttonData={loginButtonData}
          style={{width: '35%'}}
        />
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
  textName: {
    fontSize: 14,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  textDown: {
    fontSize: 12,
    fontFamily: fonts?.PoppinsRegular,
  },
  textTitle: {
    fontSize: 12,
    fontFamily: fonts?.PoppinsMedium,
  },
});

export default Celebration;
