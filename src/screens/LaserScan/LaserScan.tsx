import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, Button, View, Text } from 'react-native';
import DataWedgeIntents from 'react-native-datawedge-intents';

const LaserScan = () => {
    const [scannedData, setScannedData] = useState('');

    useEffect(() => {
        // Register DataWedge broadcast receiver
        DataWedgeIntents.registerBroadcastReceiver({
            filterActions: [
                'com.zebra.reactnativedemo.ACTION',
                'com.symbol.datawedge.api.RESULT_ACTION'
            ],
            filterCategories: [
                'android.intent.category.DEFAULT'
            ]
        });

        // Handler function for broadcast intents
        const broadcastReceiverHandler = (intent) => {
            console.log("Received Intent: ", intent);
            const scannedValue = intent?.["com.symbol.datawedge.data_string"];
            if (scannedValue) {
                console.log("Scanned data: ", scannedValue);
                setScannedData(scannedValue); // Update the state with scanned data
            }
        };

        // Register event listener for DataWedge intents
        const subscription = DeviceEventEmitter.addListener(
            'datawedge_broadcast_intent',
            broadcastReceiverHandler
        );

        // Start scanning on component mount
        // sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');

        // Cleanup on component unmount
        return () => {
            subscription.remove();
        };
    }, []);

    // Function to send DataWedge commands
    // const sendCommand = (extraName, extraValue) => {
    //     console.log("Sending Command:", extraName, JSON.stringify(extraValue));
    //     let broadcastExtras = {};
    //     broadcastExtras[extraName] = extraValue;
    //     broadcastExtras["SEND_RESULT"] = true;
    //     DataWedgeIntents.sendBroadcastWithExtras({
    //         action: "com.symbol.datawedge.api.ACTION",
    //         extras: broadcastExtras
    //     });
    // };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>Barcode Scanner using DataWedge</Text>
            {/* <Button title="Start Scan" onPress={() => sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'START_SCANNING')} />
            <Button title="Stop Scan" onPress={() => sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'STOP_SCANNING')} /> */}
            {scannedData ? (
                <Text style={{ marginTop: 20, fontSize: 18 }}>Scanned Data: {scannedData}</Text>
            ) : (
                <Text style={{ marginTop: 20, fontSize: 18 }}>No data scanned yet</Text>
            )}
        </View>
    );
};

export default LaserScan;
