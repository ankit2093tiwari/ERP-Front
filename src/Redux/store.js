import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { combineReducers } from "redux";

// Slices
import sessionReducer from '@/Redux/Slices/sessionSlice';
import authReducer from '@/Redux/Slices/authSlice';

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["session", "auth"],
};

const rootReducer = combineReducers({
    session: sessionReducer,
    auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Required for redux-persist
        }),
});

export const persistor = persistStore(store);
