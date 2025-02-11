import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import HomeHeader from '../../component/Header/HomeHeader.tsx';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar.jsx';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import CommonHeader from '../../component/Header/CommonHeader.tsx';
import {
  ArrowRight_Icon,
  Logout_Icon,
  NotificationSetting_Icon,
} from '../../assets/icons/index.jsx';
import NavigationTile from '../../component/Tiles/NavigationTile.tsx';
import fonts from '../../assets/fonts/index.js';
import {profileData} from './ProfileData.tsx';

const HomeScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  let headerData = {
    headerTitle: 'Profile',
  };

  return (
    <View
      style={[styles.homeWrapper, {backgroundColor: theme.colors.background}]}>
      <CommonHeader data={headerData} />
      <View style={styles?.profileWrapper}>
        <FlatList
          data={profileData}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => <NavigationTile item={item} />}
          ListHeaderComponent={
            <View style={styles?.imageWithText}>
              <View style={styles?.arrowCircle} />
              <View style={styles?.twoText}>
                <Text style={styles?.mainName}>Joh Doe</Text>
                <Text style={styles?.subText}>Developer</Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={styles?.titleanndIcon}>
              <Logout_Icon height={width / 20} width={width / 20} />
              <Text style={styles?.textName}>Logout</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homeWrapper: {
    height: height,
    backgroundColor: colors?.white,
  },
  profileWrapper: {
    marginTop: width / 20,
  },
  titleanndIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: width / 20,
    padding: width / 25,
    marginVertical: 10,
  },
  textName: {
    fontSize: 18,
    fontFamily: fonts?.PoppinsRegular,
    paddingHorizontal: 20,
    color: colors?.logOutRed,
  },

  imageWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: width / 20,
  },
  twoText: {
    paddingHorizontal: 10,
  },
  arrowCircle: {
    backgroundColor: colors?.greyColor,
    borderRadius: width,
    width: width / 6,
    height: width / 6,
  },
  mainName: {
    fontSize: 22,
    fontFamily: fonts?.PoppinsSemiBold,
    paddingHorizontal: 20,
  },
  subText: {
    fontSize: 16,
    fontFamily: fonts?.PoppinsRegular,
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
