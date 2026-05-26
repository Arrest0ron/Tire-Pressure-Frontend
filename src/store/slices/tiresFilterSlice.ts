import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TiresFilterState {
  searchQuery: string; // Аналог titleQuery из примера
}

const initialState: TiresFilterState = {
  searchQuery: "",
};

export const tiresFilterSlice = createSlice({
  name: "tiresFilter",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearSearchQuery(state) {
      state.searchQuery = "";
    },
  },
});

export const { setSearchQuery, clearSearchQuery } = tiresFilterSlice.actions;
export default tiresFilterSlice.reducer;