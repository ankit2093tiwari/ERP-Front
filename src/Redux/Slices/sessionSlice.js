
import { createSlice } from "@reduxjs/toolkit";

const initialState = { selectedSessionId: "" };

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setSessionId: (state, action) => {
            state.selectedSessionId = action.payload;
        },
        clearSessionId: (state) => {
            state.selectedSessionId = "";
        },
    },
});

export const { setSessionId, clearSessionId } = sessionSlice.actions;
export default sessionSlice.reducer;
