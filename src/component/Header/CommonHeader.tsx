import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Platform,
  Text,
  StatusBar,
} from 'react-native';
import {BlackMenu_Icon, BlackNotificationBing_Icon} from '../../assets/icons';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts/index.js';
import MyStatusBar from '../StatusBar.jsx';

interface CommonHeaderType {
  headerTitle: string;
}

interface CommonHeaderProps {
  data: CommonHeaderType;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({data}) => {
  const {headerTitle} = data;

  return (
    <>
      <MyStatusBar
        barStyle="dark-content"
        backgroundColor={
          Platform.OS === 'android' ? 'transparent' : colors?.white
        }
      />
      <View style={styles.headerContainner}>
        <View style={styles?.upperArea}>
          <BlackMenu_Icon height={width / 14} width={width / 14} />
          <Text style={styles?.greetHeading}>{headerTitle}</Text>
          <BlackNotificationBing_Icon height={width / 14} width={width / 14} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainner: {
    width: '100%',
    height: height / 18,
    justifyContent: 'space-around',
    backgroundColor: colors?.white,
    paddingHorizontal: width / 20,
  },
  upperArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  greetHeading: {
    color: colors.black,
    fontSize: 20,
    fontFamily: fonts.PoppinsRegular,
    paddingHorizontal: 5,
  },
});

export default CommonHeader;
