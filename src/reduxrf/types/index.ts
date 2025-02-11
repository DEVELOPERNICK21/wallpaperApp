export interface UserDetails {
  data: {
    assigned_badges: any[]; // Update `any` with a more specific type if available
    event_id: string;
    event_logo: string;
    event_name: string;
    excel_security_password: string;
    space_name: string;
    timezone: string | null;
    type: string;
    user_id: string;
  };
}

export interface userToken {
  token: string;
}

export interface appStateType {
  isFirstLaunch: boolean;
}

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

export interface BadgeData {
  badge_number: string;
  event_id: string | null;
  badge_type: string;
  visited_date: string;
  user_id: string | null;
  space_name: string | null;
  event_name: string | null;
}
