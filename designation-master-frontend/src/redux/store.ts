import { configureStore } from "@reduxjs/toolkit";
import designationReducer from "./slices/designationSlice";

export const store = configureStore({
  reducer: {
    designation: designationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
