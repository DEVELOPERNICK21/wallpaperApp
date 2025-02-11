declare module 'react-native-datawedge-intents' {
    export interface BroadcastReceiverConfig {
        filterActions: string[];
        filterCategories: string[];
    }
    
    const DataWedgeIntents: {
        registerBroadcastReceiver(config: BroadcastReceiverConfig): void;
    };
    
    export default DataWedgeIntents;
}
