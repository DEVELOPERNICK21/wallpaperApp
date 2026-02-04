import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  BlackMenu_Icon,
  BlackNotificationBing_Icon,
  ArrowRight_Icon,
} from '../../assets/icons';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts/index.js';
import MyStatusBar from '../StatusBar.jsx';

interface CommonHeaderType {
  headerTitle: string;
  /** Set false to hide the hamburger/menu icon (e.g. Dynamic Island screen) */
  showLeftIcon?: boolean;
  /** Set false to hide the notification icon */
  showRightIcon?: boolean;
  /** Show back arrow on the left and call onBackPress when tapped */
  showBackIcon?: boolean;
  onBackPress?: () => void;
}

interface CommonHeaderProps {
  data: CommonHeaderType;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({data}) => {
  const {
    headerTitle,
    showLeftIcon = true,
    showRightIcon = true,
    showBackIcon = false,
    onBackPress,
  } = data;

  const leftContent = () => {
    if (showBackIcon && onBackPress) {
      return (
        <TouchableOpacity
          onPress={onBackPress}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          style={styles.backButton}>
          <View style={styles.backArrow}>
            <ArrowRight_Icon height={width / 14} width={width / 14} />
          </View>
        </TouchableOpacity>
      );
    }
    if (showLeftIcon) {
      return <BlackMenu_Icon height={width / 14} width={width / 14} />;
    }
    return <View style={styles.iconPlaceholder} />;
  };

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
          {leftContent()}
          <Text style={styles?.greetHeading}>{headerTitle}</Text>
          {showRightIcon ? (
            <BlackNotificationBing_Icon height={width / 14} width={width / 14} />
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
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
  iconPlaceholder: {
    width: width / 14,
    height: width / 14,
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    transform: [{rotate: '180deg'}],
  },
});

export default CommonHeader;
