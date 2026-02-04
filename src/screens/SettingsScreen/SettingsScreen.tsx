import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../assets/color';
import {height, width} from '../../assets/string.tsx';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from '../../component/Header/CommonHeader.tsx';
import {
  ArrowRight_Icon,
  Logout_Icon,
  NotificationSetting_Icon,
  PrivacySetting_Icon,
  TermSetting_Icon,
} from '../../assets/icons/index.jsx';
import {Platform} from 'react-native';
import NavigationTile from '../../component/Tiles/NavigationTile.tsx';
import fonts from '../../assets/fonts/index.js';
import ScreenConstants from '../../Routes/ScreenConstants';

const SettingsScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();

  let headerData = {
    headerTitle: 'Setting',
  };

  let settingData = [
    {
      id: 'notifications',
      Icon: NotificationSetting_Icon,
      title: 'Notification',
      IconnTwo: ArrowRight_Icon,
      onPress: () =>
        navigation.navigate(
          ScreenConstants?.NOTIFICATION_SETTINGS_SCREEN as never,
        ),
    },
    ...(Platform.OS === 'ios'
      ? [
          {
            id: 'dynamicIsland',
            Icon: NotificationSetting_Icon,
            title: 'Dynamic Island',
            IconnTwo: ArrowRight_Icon,
            onPress: () =>
              navigation.navigate(
                ScreenConstants?.DYNAMIC_ISLAND_SETTINGS_SCREEN as never,
              ),
          },
        ]
      : []),
    {
      id: 'privacyControls',
      Icon: PrivacySetting_Icon,
      title: 'Privacy & Security Controls',
      IconnTwo: ArrowRight_Icon,
      onPress: () =>
        navigation.navigate(ScreenConstants?.PRIVACY_SECURITY_SCREEN as never),
    },
    {
      id: 'policy',
      Icon: TermSetting_Icon,
      title: 'Privacy Policy & Acceptable Use',
      IconnTwo: ArrowRight_Icon,
      onPress: () =>
        navigation.navigate(ScreenConstants?.PRIVACY_POLICY_SCREEN as never),
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
