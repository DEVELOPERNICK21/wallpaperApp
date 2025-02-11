import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import HomeHeader from '../../component/Header/HomeHeader.tsx';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar.jsx';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import CommonHeader from '../../component/Header/CommonHeader.tsx';
import {FlatList} from 'react-native-gesture-handler';
import AlertTile from '../../component/Tiles/AlertTile.tsx';

const AlertScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();

  const dispatch = useDispatch();

  let headerData = {
    headerTitle: 'Alert',
  };

  let taskListData = [
    {
      id: 0,
      name: 'Nick',
      title: 'Website Desgin',
    },
    {
      id: 1,
      name: 'Pratik',
      title: 'Website Development',
    },
    {
      id: 2,
      name: 'Mike',
      title: 'Mobile Desgin',
    },
    {
      id: 3,
      name: 'Nick',
      title: 'Mobile Development',
    },
    {
      id: 3,
      name: 'Nick',
      title: 'Mobile Development',
    },
    {
      id: 3,
      name: 'Nick',
      title: 'Mobile Development',
    },
    {
      id: 3,
      name: 'Nick',
      title: 'Mobile Development',
    },
    {
      id: 3,
      name: 'Nick',
      title: 'Mobile Development',
    },
  ];

  return (
    <View
      style={[styles.homeWrapper, {backgroundColor: theme.colors.background}]}>
      <CommonHeader data={headerData} />
      <View>
        <FlatList
          data={taskListData}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => <AlertTile item={item} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homeWrapper: {
    // flex: 1,
    // height: height,
    // backgroundColor: colors?.white,
  },
});

export default AlertScreen;
