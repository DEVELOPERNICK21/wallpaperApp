/**
 * Calendar Image Generator Utility
 * 
 * This utility generates calendar images for background tasks.
 * Since we can't render React components in headless mode, this provides
 * a way to generate calendar images programmatically.
 * 
 * NOTE: This is a simplified version. For full calendar rendering in background,
 * you would need a native module or server-side rendering.
 */

import {Platform, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

interface CalendarConfig {
  year: number;
  theme: {
    background: string;
    passed: string;
    today: string;
    future: string;
  };
}

/**
 * Calculate days passed in the year
 */
export const calculateDaysPassed = (year: number): number => {
  const today = new Date();
  const startOfYear = new Date(year, 0, 1);
  const diffTime = today.getTime() - startOfYear.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeapYear ? 366 : 365;
  return Math.min(Math.max(diffDays, 0), totalDays);
};

/**
 * Get calendar configuration from storage
 */
export const getCalendarConfig = async (): Promise<CalendarConfig | null> => {
  try {
    const year = new Date().getFullYear();
    const themeKey = await AsyncStorage.getItem('selectedTheme') || 'classic';
    
    // Default classic theme (black background, white dots)
    const themes: {[key: string]: any} = {
      classic: {
        background: '#000000',
        passed: '#ffffff',
        today: '#f97316',
        future: '#ffffff',
      },
    };

    const theme = themes[themeKey] || themes.classic;

    return {
      year,
      theme,
    };
  } catch (error) {
    console.error('Error getting calendar config:', error);
    return null;
  }
};

/**
 * Generate calendar image data
 * 
 * NOTE: This is a placeholder. In a real implementation, you would:
 * 1. Use a native module to draw on Canvas
 * 2. Use server-side rendering
 * 3. Use react-native-skia or similar for headless rendering
 * 
 * For now, this returns metadata that can be used to generate the image
 */
export const generateCalendarImageData = async (): Promise<{
  width: number;
  height: number;
  config: CalendarConfig;
  daysPassed: number;
  totalDays: number;
} | null> => {
  try {
    const config = await getCalendarConfig();
    if (!config) {
      return null;
    }

    const isLeapYear =
      (config.year % 4 === 0 && config.year % 100 !== 0) ||
      config.year % 400 === 0;
    const totalDays = isLeapYear ? 366 : 365;
    const daysPassed = calculateDaysPassed(config.year);

    return {
      width,
      height: height * 0.6, // Match calendar container height
      config,
      daysPassed,
      totalDays,
    };
  } catch (error) {
    console.error('Error generating calendar image data:', error);
    return null;
  }
};
