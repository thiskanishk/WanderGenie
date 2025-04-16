// TripPlan interface
export interface TripPlan {
  destination: string;
  duration: string;
  budget: string;
  image?: string;
  tripType?: string;
  summary?: string;
  itinerary: {
    day: number;
    weather?: string;
    morning?: string[];
    afternoon?: string[];
    evening?: string[];
    activities: string[];
  }[];
  tips: string[];
  estimatedCosts?: {
    accommodation: string;
    food: string;
    activities: string;
    transportation: string;
    extras?: string;
    total: string;
  };
  flightDetails?: {
    outbound: {
      airline: string;
      flightNumber: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
    };
    return?: {
      airline: string;
      flightNumber: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
    };
  };
  accommodation?: {
    name: string;
    type: string;
    address: string;
    rating: number;
    amenities: string[];
    price: string;
    image?: string;
  };
}

// User selected preferences
export interface UserSelections {
  tripType: string;
  vibe: string;
  budget: string;
  duration: string;
  useAI?: boolean;  // Flag to determine if AI should be used for trip generation
}

// Trip suggestion params
export interface TripSuggestionParams {
  tripPlans: TripPlan[];
  userSelections: UserSelections;
}

// Trip result params
export interface TripResultParams {
  tripPlan: TripPlan;
  userSelections?: UserSelections;
} 