
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Designation } from "../../types/designation";

interface DesignationState {
  data: Designation[];
  loading: boolean;
  error: string | null;
}

const initialState: DesignationState = {
  data: [],
  loading: false,
  error: null,
};

const designationSlice = createSlice({
  name: "designation",
  initialState,
  reducers: {
    setDesignations: (state, action: PayloadAction<Designation[]>) => {
      state.data = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearDesignations: (state) => {
      state.data = [];
      state.error = null;
    },
  },
});

export const { setDesignations, setLoading, setError, clearDesignations } =
  designationSlice.actions;

export default designationSlice.reducer;
