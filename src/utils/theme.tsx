import { colors } from "../assets/color";

// themeTypes.ts
export interface ThemeState {
    darkMode: boolean;
    colors: {
        background: string;
        text: string;
        primary: string;
        accent: string;
        // Add more colors as needed
    };
}

export const lightTheme: ThemeState = {
    darkMode: false,
    colors: {
        background: colors?.white,
        text: colors?.black,
        primary: '#4A90E2',
        accent: '#FF4081',
    },
};

export const darkTheme: ThemeState = {
    darkMode: true,
    colors: {
        background: colors?.black,
        text: colors?.white,
        primary: '#BB86FC',
        accent: '#03DAC6',
    },
};
