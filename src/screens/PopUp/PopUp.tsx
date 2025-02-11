import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import HomeHeader from '../../component/Header/HomeHeader.tsx';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar.jsx';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const PopUp: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  return (
    <>
      <View
        style={[
          styles.homeWrapper,
          {backgroundColor: theme.colors.background},
        ]}>
        <MyStatusBar
          translucent={true}
          backgroundColor={colors?.greyColor}
          barStyle="dark-content"
        />
        <HomeHeader />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  homeWrapper: {
    // flex: 1,
    height: height,
    backgroundColor: colors?.white,
  },
});

export default PopUp;
