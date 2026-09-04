import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThemeState } from "../types";

const initialState: ThemeState = {
    theme: "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const theme = state.theme === "light" ? "dark" : "light";
            localStorage.setItem("theme", theme);
            document.documentElement.classList.toggle("dark");
            state.theme = theme;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        loadTheme: (state) => {
            const theme = localStorage.getItem("theme") as 'light' | 'dark' | null;
            if (theme) {
                state.theme = theme;
                if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                }
            }
        },
    },
});

export const { toggleTheme, setTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;
