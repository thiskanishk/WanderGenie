export interface TripPreferences {
  tripType: string;
  vibe: string;
  budget: string;
  duration: string;
}

export interface DayPlan {
  day: number;
  activities: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

export interface TripPlan {
  destination: string;
  summary: string;
  days: DayPlan[];
  travelTips: string[];
  estimatedBudget: string;
  preferences: TripPreferences;
}

export interface NavigationParams {
  tripPlan?: TripPlan;
} 