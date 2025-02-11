import { fetch } from "@react-native-community/netinfo";

export const isInternetConnected = async () => {
    return (await fetch()).isConnected;
};