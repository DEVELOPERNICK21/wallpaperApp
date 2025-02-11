import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { ComingSoon_Icon, Notify_Icon } from '../../assets/icons';
import { height, width } from '../../assets/string.tsx';
import CustomButton from '../../component/CustomButton';
import CommonThinInput from '../../component/Input/CommonThinInput';
import { colors } from '../../assets/color';
import fonts from '../../assets/fonts';
import CustomCheckbox from '../../component/CheckBox/CustomCheckbox';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants';
import CustomThinButton from '../../component/Buttons/CustomThinButton';
import CustomTextInput from '../../component/CustomTextInput';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/actions/user.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../redux/reducers/index.ts';

type RootStackParamList = {
    SignInScreen: undefined;
    // other screens...
};

const ComingSoonScreen: React.FC = () => {
    const [confirmCode, setConfirmCode] = useState<string[]>(Array(4).fill('3'));
    const [greet, setgreet] = useState<string>();

    const { user, token } = useSelector((state: RootState) => state.userDetails);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();


    useEffect(() => {
        Greet();
    }, []);


    const confirmPass = {
        title: '',
        palceHolderText: 'Enter confirm password',
        changedText: (text: string) => {
            console.log(text);
        },
    };

    const logOutHandle = async () => {
        // dispatch(logoutUser());
        await AsyncStorage.removeItem('userToken');
    }

    const NotifyMe = {
        buttonTitle: 'Notify Me',
        FirstIcon: Notify_Icon,
        onPress: () => { logOutHandle() },
    };

    const Greet = () => {

        var myDate = new Date();
        var hrs = myDate.getHours();


        if (hrs < 12) {
            setgreet('Good Morning!');
        }
        else if (hrs >= 12 && hrs <= 17) {
            setgreet('Good Afternoon!');
        }
        else if (hrs >= 17 && hrs <= 24) {
            setgreet('Good Evening!');
        }
    };




    return (
        <View style={styles.loginWrapper}>
            <View style={styles.contentArea}>
                <View style={styles.LogoIcon}>
                    <ComingSoon_Icon height={height / 3} width={width} />
                </View>
                <View style={styles?.centerContent} >
                    {/* <Text style={styles.textMainHeading}>{greet} {user?.name}</Text> */}
                    <Text style={styles.textMainHeading}>Coming Soon</Text>
                    <Text style={styles.socialHeading}>Something new is on its way</Text>
                </View>
                <View style={styles.ShowDigitArea}>
                    {confirmCode.map((digit, index) => (
                        <TextInput
                            key={index}
                            value={digit}
                            // onChangeText={(text) => handleInputChange(text, index, setConfirmCode, confirmKeyboardFocus)}
                            style={[
                                styles.InputFeild
                            ]}
                            keyboardType='numeric'
                            maxLength={1}
                        // ref={(el) => (confirmKeyboardFocus.current[index] = el)}
                        />
                    ))}
                </View>
                <View style={styles?.textAndButton} >
                    <CustomTextInput inputData={confirmPass} style={{ width: '60%' }} />
                    <CustomButton buttonData={NotifyMe} style={{ width: '35%' }} />
                </View>

                {/* <View style={styles?.iconsView} >
                    <FaceBookGrey_Icon height={height / 35} width={height / 35} />
                    <GoogleGrey_Icon height={height / 35} width={height / 35} />
                </View> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    loginWrapper: {
        flex: 1,
        backgroundColor: colors?.white,
    },
    LogoIcon: {
        height: height / 2,
        // backgroundColor: 'red',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentArea: {
        // justifyContent: 'center',
        paddingHorizontal: width / 15,
        alignItems: 'center',
        height: height / 1.2,
    },
    textAndButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        // backgroundColor: 'pink'
    },
    iconsView: {
        flexDirection: 'row',
        marginVertical: 20,
        width: width / 5,
        justifyContent: 'space-between'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    textMainHeading: {
        color: colors.textBlackColor,
        fontSize: 26,
        fontFamily: fonts.PoppinsSemiBold,
        marginVertical: 10,
    },
    socialHeading: {
        color: colors.textbluishGrey,
        fontSize: 12,
        fontFamily: fonts.PoppinsRegular,
        marginVertical: 10,
        marginBottom: width / 40,
    },

    greenText: {
        color: colors.primaryColor,
        fontSize: 12,
        textAlign: 'center',
        fontFamily: fonts.PoppinsMedium,
    },
    ShowDigitArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    InputFeild: {
        width: width / 7,
        height: height / 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors?.inputBorder,
        textAlign: 'center',
        marginHorizontal: 10,
        marginVertical: width / 20,
    },
});

export default ComingSoonScreen;
