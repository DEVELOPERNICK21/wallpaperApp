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
  Chevron_Icon,
  Logout_Icon,
  Notification_Icon,
  NotificationSetting_Icon,
  PrivacySetting_Icon,
  TermSetting_Icon,
} from '../../assets/icons/index.jsx';
import NavigationTile from '../../component/Tiles/NavigationTile.tsx';
import fonts from '../../assets/fonts/index.js';

const SettingsScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  let headerData = {
    headerTitle: 'Setting',
  };

  let settingData = [
    {
      id: 0,
      Icon: NotificationSetting_Icon,
      title: 'Notification',
      IconnTwo: ArrowRight_Icon,
    },
    {
      id: 0,
      Icon: TermSetting_Icon,
      title: 'Terms & Condition',
      IconnTwo: ArrowRight_Icon,
    },
    {
      id: 0,
      Icon: PrivacySetting_Icon,
      title: 'Privacy Policy',
      IconnTwo: ArrowRight_Icon,
    },
  ];

  return (
    <View
      style={[styles.homeWrapper, {backgroundColor: theme.colors.background}]}>
      <CommonHeader data={headerData} />
      <View style={styles?.profileWrapper}>
        <FlatList
          data={settingData}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => <NavigationTile item={item} />}
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
    fontSize: 16,
    fontFamily: fonts?.PoppinsRegular,
    paddingHorizontal: 20,
    color: colors?.logOutRed,
  },
});

export default SettingsScreen;
