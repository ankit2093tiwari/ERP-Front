
import { createSlice } from "@reduxjs/toolkit";

const initialState = { selectedSessionId: typeof window !== "undefined" ? localStorage.getItem("selectedSessionId") || "" : "", };

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setSessionId: (state, action) => {
            state.selectedSessionId = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("selectedSessionId", action.payload);
            }
        },
        clearSessionId: (state) => {
            state.selectedSessionId = "";
            if (typeof window !== "undefined") {
                localStorage.removeItem("selectedSessionId");
            }
        },
    },
});

export const { setSessionId, clearSessionId } = sessionSlice.actions;
export default sessionSlice.reducer;
