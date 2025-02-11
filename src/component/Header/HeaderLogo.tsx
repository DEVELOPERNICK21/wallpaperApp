import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { AppLogo_Icon } from '../../assets/icons';
import { height, width } from '../../assets/string.tsx';

const HeaderLogo: React.FC = () => {

    return (
        <View style={styles.headerContainner}>
            <AppLogo_Icon height={'80%'} width={'70%'} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainner: {
        width: width,
        height: height / 12,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'green',
    },
});

export default HeaderLogo;
