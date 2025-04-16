// Mock trip plans for multiple destination suggestions
import { TripPlan } from '../types/tripTypes';

// Helper function to create a consistent trip plan structure
const createTripPlan = (
  destination: string,
  image: string,
  summary: string,
  tripType: string,
  budget: string,
  duration: string,
  days: number
): TripPlan => {
  // Generate a day-by-day itinerary based on number of days
  const itinerary = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    activities: [
      `Explore ${destination} - Day ${i + 1}`,
      `Local cuisine experience`,
      `Cultural activity`
    ],
    weather: ['Sunny', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
    morning: [`Breakfast at local café`, `Explore the ${tripType === 'Beach' ? 'coastline' : tripType === 'Mountain' ? 'trails' : 'downtown area'}`],
    afternoon: [`Lunch at highly-rated restaurant`, `Visit top attraction in ${destination}`],
    evening: [`Dinner experience`, `Night entertainment in ${destination}`]
  }));

  return {
    destination,
    image,
    summary,
    tripType,
    budget,
    duration,
    itinerary,
    tips: [
      `Best time to visit ${destination} is during spring and fall`,
      `Don't miss the local cuisine, especially the signature dishes`,
      `Public transportation is the best way to get around`
    ],
    estimatedCosts: {
      accommodation: budget === 'Budget' ? '$300' : budget === 'Mid-Range' ? '$600' : '$1,200',
      food: budget === 'Budget' ? '$200' : budget === 'Mid-Range' ? '$400' : '$800',
      activities: budget === 'Budget' ? '$150' : budget === 'Mid-Range' ? '$300' : '$600',
      transportation: budget === 'Budget' ? '$100' : budget === 'Mid-Range' ? '$200' : '$400',
      total: budget === 'Budget' ? '$750' : budget === 'Mid-Range' ? '$1,500' : '$3,000'
    },
    accommodation: {
      name: `${budget === 'Luxury' ? 'Luxury' : budget === 'Mid-Range' ? 'Boutique' : 'Budget'} Stay in ${destination}`,
      type: budget === 'Luxury' ? '5-star Hotel' : budget === 'Mid-Range' ? '4-star Hotel' : 'Hostel/Budget Hotel',
      address: `123 Main Street, ${destination}`,
      rating: budget === 'Luxury' ? 5 : budget === 'Mid-Range' ? 4 : 3,
      amenities: ['WiFi', 'Breakfast', 'Pool', 'Gym'].slice(0, budget === 'Luxury' ? 4 : budget === 'Mid-Range' ? 3 : 2),
      price: budget === 'Luxury' ? '$250/night' : budget === 'Mid-Range' ? '$150/night' : '$75/night'
    }
  };
};

// Create an array of diverse trip options
export const mockTripOptions: TripPlan[] = [
  createTripPlan(
    'Bali, Indonesia',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    'Experience the perfect blend of beaches, culture, and relaxation in this tropical paradise',
    'Beach',
    'Mid-Range',
    '1 Week',
    7
  ),
  createTripPlan(
    'Kyoto, Japan',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9',
    'Immerse yourself in ancient traditions, stunning temples, and exquisite gardens',
    'Cultural',
    'Mid-Range',
    '10 Days',
    10
  ),
  createTripPlan(
    'Swiss Alps, Switzerland',
    'https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35',
    'Adventure in breathtaking mountain landscapes with world-class hiking and skiing',
    'Mountain',
    'Luxury',
    '2 Weeks',
    14
  ),
  createTripPlan(
    'Barcelona, Spain',
    'https://images.unsplash.com/photo-1539037116277-4db20889f98d',
    'Explore stunning architecture, vibrant culture, and Mediterranean beaches',
    'City',
    'Budget',
    '5 Days',
    5
  ),
  createTripPlan(
    'Cape Town, South Africa',
    'https://images.unsplash.com/photo-1576485375217-d6a95e34d043',
    'Discover diverse landscapes from mountains to beaches, alongside rich cultural experiences',
    'Adventure',
    'Mid-Range',
    '8 Days',
    8
  )
];

// Function to get filtered trip options based on user preferences
export const getFilteredTripOptions = (
  tripType?: string,
  budget?: string,
  duration?: string
): TripPlan[] => {
  let filteredOptions = [...mockTripOptions];
  
  // Apply filters if specified
  if (tripType) {
    filteredOptions = filteredOptions.filter(
      option => option.tripType.toLowerCase().includes(tripType.toLowerCase())
    );
  }
  
  if (budget) {
    filteredOptions = filteredOptions.filter(
      option => option.budget.toLowerCase().includes(budget.toLowerCase())
    );
  }
  
  if (duration) {
    filteredOptions = filteredOptions.filter(
      option => option.duration.toLowerCase().includes(duration.toLowerCase())
    );
  }
  
  // If no matches after filtering, return all options
  return filteredOptions.length > 0 ? filteredOptions : mockTripOptions;
}; 