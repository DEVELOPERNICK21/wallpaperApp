import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from '../../component/Header/CommonHeader';
import DynamicIslandSettingsContent from '../../component/DynamicIslandSettingsContent/DynamicIslandSettingsContent';
import {colors} from '../../assets/color';

const DynamicIslandSettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const headerData = {
    headerTitle: 'Dynamic Island',
    showLeftIcon: false,
    showRightIcon: false,
    showBackIcon: true,
    onBackPress: () => navigation.goBack(),
  };

  return (
    <View style={styles.container}>
      <CommonHeader data={headerData} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <DynamicIslandSettingsContent />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default DynamicIslandSettingsScreen;
