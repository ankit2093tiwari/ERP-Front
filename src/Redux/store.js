import { configureStore } from "@reduxjs/toolkit";
import counterReducer from '@/Redux/Slices/counterSlice'
import sessionReducer from '@/Redux/Slices/sessionSlice'
export const store=configureStore({
    reducer:{
        counter:counterReducer,
        session:sessionReducer
    }
})