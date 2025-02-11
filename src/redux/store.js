// store/index.js
import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {thunk} from 'redux-thunk'; // Import redux-thunk middleware
import rootReducer from './reducers'; // Your root reducer

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store with middleware and the persisted reducer
export const store = createStore(
  persistedReducer,
  applyMiddleware(thunk) // Apply redux-thunk middleware
);

// Create a persistor for the Redux store
export const persistor = persistStore(store);
