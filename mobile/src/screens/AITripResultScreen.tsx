import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Animated,
  Dimensions,
  Platform,
  Linking,
  FlatList,
  Modal,
  TextInput
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';

// Mock trip plan data (fallback if no data is provided)
const mockTripPlan = {
  destination: "Bali, Indonesia",
  duration: "5 Days",
  summary: "A relaxing beach adventure with culture and local food",
  budget: "Mid-range",
  itinerary: [
    { day: 1, activities: ["Arrive in Bali", "Sunset at Tanah Lot Temple"] },
    { day: 2, activities: ["Ubud Forest", "Local market walk"] },
    { day: 3, activities: ["Snorkeling at Blue Lagoon", "Beach chill"] },
    { day: 4, activities: ["Temple visit", "Balinese massage"] },
    { day: 5, activities: ["Beach breakfast", "Departure"] }
  ],
  tips: [
    "Carry sunscreen",
    "Book temple tickets in advance",
    "Download offline maps"
  ]
};

// Define the TripPlan interface (comprehensive version)
interface TripPlan {
  destination: string;
  duration: string;
  budget: string;
  image?: string;
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
interface UserSelections {
  tripType: string;
  vibe: string;
  budget: string;
  duration: string;
}

// Props for ItineraryDayCard component
interface ItineraryDayCardProps {
  day: number;
  activities: string[];
  weather?: string;
  morning?: string[];
  afternoon?: string[];
  evening?: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

// Props for TipCard component
interface TipCardProps {
  tip: string;
}

// Define type for route params - support both simple and advanced versions
type AITripResultScreenParams = {
  tripPlan: TripPlan;
  userSelections?: UserSelections;
};

// Create animated ScrollView component
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Component for displaying a single day's itinerary
const ItineraryDayCard: React.FC<ItineraryDayCardProps> = ({ 
  day, 
  activities, 
  weather,
  morning,
  afternoon,
  evening,
  isExpanded, 
  onToggle 
}) => {
  return (
    <View style={styles.dayCard}>
      <TouchableOpacity 
        style={styles.dayHeader} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.dayHeaderLeft}>
          <View style={styles.dayCircle}>
            <Text style={styles.dayNumber}>{day}</Text>
          </View>
          <Text style={styles.dayTitle}>Day {day}</Text>
          {weather && (
            <View style={styles.weatherTag}>
              <Text style={styles.weatherText}>{weather}</Text>
            </View>
          )}
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6200ee" 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.dayContent}>
          {/* If detailed schedule is available (morning/afternoon/evening) */}
          {(morning || afternoon || evening) ? (
            <View style={styles.detailedSchedule}>
              {morning && morning.length > 0 && (
                <View style={styles.timeSection}>
                  <Text style={styles.timeSectionTitle}>Morning</Text>
                  {morning.map((activity, index) => (
                    <View key={`morning-${index}`} style={styles.activityItem}>
                      <View style={styles.activityBullet} />
                      <Text style={styles.activityText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {afternoon && afternoon.length > 0 && (
                <View style={styles.timeSection}>
                  <Text style={styles.timeSectionTitle}>Afternoon</Text>
                  {afternoon.map((activity, index) => (
                    <View key={`afternoon-${index}`} style={styles.activityItem}>
                      <View style={styles.activityBullet} />
                      <Text style={styles.activityText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {evening && evening.length > 0 && (
                <View style={styles.timeSection}>
                  <Text style={styles.timeSectionTitle}>Evening</Text>
                  {evening.map((activity, index) => (
                    <View key={`evening-${index}`} style={styles.activityItem}>
                      <View style={styles.activityBullet} />
                      <Text style={styles.activityText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            // Simple activity list
            <View style={styles.activitiesList}>
              {activities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityBullet} />
                  <Text style={styles.activityText}>{activity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Component for displaying a travel tip
const TipCard: React.FC<TipCardProps> = ({ tip }) => {
  return (
    <View style={styles.tipItem}>
      <Ionicons name="information-circle-outline" size={20} color="#6200ee" />
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
};

const AITripResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  
  // Screen dimensions for responsive design
  const { width } = Dimensions.get('window');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 60;
  
  // Get route params, with fallbacks
  const routeParams = route.params as AITripResultScreenParams || {};
  const [tripPlan, setTripPlan] = useState<TripPlan>(routeParams.tripPlan || mockTripPlan);
  const userSelections = routeParams.userSelections || {
    tripType: "Vacation",
    vibe: "Relaxing",
    budget: tripPlan.budget || "Mid-range",
    duration: tripPlan.duration || "5 Days"
  };
  
  // UI state
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [flightExpanded, setFlightExpanded] = useState(false);
  const [hotelExpanded, setHotelExpanded] = useState(false);
  const [budgetExpanded, setBudgetExpanded] = useState(true);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Default image if none provided
  const destinationImage = tripPlan.image || 
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  
  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp'
  });
  
  // Handle day expansion in the itinerary
  const toggleDayExpansion = (dayNumber: number) => {
    if (expandedDay === dayNumber) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dayNumber);
    }
  };
  
  // Share trip plan
  const handleShare = async () => {
    try {
      // Create a formatted message with the trip details
      let message = `🌍 ${userSelections.tripType} Trip to ${tripPlan.destination} 🌍\n\n`;
      message += `${tripPlan.summary || ''}\n`;
      message += `Duration: ${tripPlan.duration}\n`;
      message += `Budget: ${tripPlan.budget}\n\n`;
      
      message += `📅 Itinerary Highlights:\n`;
      tripPlan.itinerary.forEach(day => {
        message += `Day ${day.day}:\n`;
        
        // Use activities or morning/afternoon/evening based on what's available
        const dayActivities = day.activities || [];
        if (dayActivities.length > 0) {
          dayActivities.slice(0, 2).forEach(activity => message += `- ${activity}\n`);
          if (dayActivities.length > 2) message += `- And more...\n`;
        }
        
        message += '\n';
      });
      
      // Add estimated cost if available
      if (tripPlan.estimatedCosts?.total) {
        message += `💰 Estimated Cost: ${tripPlan.estimatedCosts.total}\n\n`;
      }
      
      // Add travel tips
      if (tripPlan.tips && tripPlan.tips.length > 0) {
        message += `💡 Travel Tips:\n`;
        tripPlan.tips.forEach(tip => message += `- ${tip}\n`);
        message += '\n';
      }
      
      message += `✨ Generated with WanderGenie AI Trip Planner`;

      await Share.share({
        message,
        title: `My Trip to ${tripPlan.destination}`,
      });
    } catch (error) {
      console.error('Error sharing trip plan:', error);
    }
  };
  
  // Save trip to user's account
  const handleSaveTrip = () => {
    console.log("🧭 Saving trip: ", JSON.stringify(tripPlan, null, 2));

    // Create a simple summary object with only string/number values
    // to avoid "Objects are not valid as React child" errors
    navigation.navigate('SavedTrips' as never, {
      tripPlanSummary: {
        destination: tripPlan.destination,
        duration: typeof tripPlan.duration === 'string' ? tripPlan.duration : String(tripPlan.duration),
        budget: typeof tripPlan.budget === 'string' ? tripPlan.budget : String(tripPlan.budget),
        summary: tripPlan.summary || '',
        days: tripPlan.itinerary?.length || 0,
        image: tripPlan.image || ''
      }
    } as never);
  };
  
  // Edit trip plan
  const handleEditTrip = () => {
    navigation.navigate('AITripPlannerScreen' as never, {
      userSelections,
      isEditing: true
    } as never);
  };
  
  // Generate new plan
  const handleReplan = () => {
    navigation.navigate('AITripPlannerScreen' as never, {
      ...userSelections,
      isReplanning: true
    } as never);
  };
  
  // Generate budget chart data if available
  const getBudgetChartData = () => {
    if (!tripPlan.estimatedCosts) return [];
    
    const costCategories = [
      { name: 'Stay', cost: tripPlan.estimatedCosts.accommodation, color: '#6A11CB' },
      { name: 'Food', cost: tripPlan.estimatedCosts.food, color: '#2575FC' },
      { name: 'Activities', cost: tripPlan.estimatedCosts.activities, color: '#23B6E6' },
      { name: 'Transport', cost: tripPlan.estimatedCosts.transportation, color: '#5CDB95' },
    ];
    
    if (tripPlan.estimatedCosts.extras) {
      costCategories.push({ 
        name: 'Extras', 
        cost: tripPlan.estimatedCosts.extras, 
        color: '#FF9F43' 
      });
    }
    
    // Convert string costs to numbers for chart
    return costCategories.map(category => {
      const value = Number(category.cost.replace(/[^0-9.-]+/g, ''));
      return {
        name: category.name,
        population: value,
        color: category.color,
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });
  };
  
  // Handle external booking links
  const handleBooking = (type: 'flight' | 'hotel') => {
    // In a real app, these would link to actual booking pages
    const urls = {
      flight: 'https://www.expedia.com/Flights',
      hotel: 'https://www.booking.com/'
    };
    
    Linking.openURL(urls[type]).catch(err => 
      console.error('An error occurred opening the link:', err)
    );
  };
  
  // Export to PDF
  const handleExportPDF = () => {
    // In a real app, you would generate and share a PDF
    console.log('Export to PDF functionality would go here');
    // Show a message to user
    alert('Your trip has been exported as PDF');
  };
  
  // Submit feedback
  const handleSubmitFeedback = () => {
    // In a real app, you would send this feedback to your backend
    console.log('Feedback submitted:', feedback);
    setFeedbackModalVisible(false);
    setFeedback('');
    // Show confirmation to user
    alert('Thank you for your feedback!');
  };

  // Render loading state if needed
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Generating your dream trip...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header - Appears on scroll */}
      <Animated.View 
        style={[
          styles.stickyHeader, 
          { 
            opacity: headerOpacity, 
            transform: [{ 
              translateY: headerOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-headerHeight, 0]
              })
            }] 
          }
        ]}
      >
        <Text style={styles.stickyHeaderTitle}>Your Trip Plan 🧳</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleReplan}>
            <Ionicons name="refresh-outline" size={22} color="#6A11CB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="#6A11CB" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Main Scrollable Content */}
      <AnimatedScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Banner with Destination */}
        <Animated.View 
          style={[
            styles.heroContainer,
            { transform: [{ scale: heroScale }] }
          ]}
        >
          <Image 
            source={{ uri: destinationImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationTitle}>{tripPlan.destination || 'Destination'}</Text>
              <Text style={styles.destinationSubtitle}>
                {tripPlan.duration || 'Duration'} • {typeof tripPlan.budget === 'string' ? tripPlan.budget : 'Budget not specified'}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* User Selections Summary */}
        <View style={styles.preferencesContainer}>
          <Text style={styles.sectionTitle}>Your Trip Preferences</Text>
          <View style={styles.preferenceChips}>
            <View style={styles.preferenceChip}>
              <Ionicons name="map-outline" size={16} color="#6A11CB" />
              <Text style={styles.preferenceText}>{userSelections?.tripType || 'Not specified'}</Text>
            </View>
            <View style={styles.preferenceChip}>
              <Ionicons name="heart-outline" size={16} color="#6A11CB" />
              <Text style={styles.preferenceText}>{userSelections?.vibe || 'Not specified'}</Text>
            </View>
            <View style={styles.preferenceChip}>
              <Ionicons name="cash-outline" size={16} color="#6A11CB" />
              <Text style={styles.preferenceText}>{userSelections?.budget || 'Not specified'}</Text>
            </View>
            <View style={styles.preferenceChip}>
              <Ionicons name="time-outline" size={16} color="#6A11CB" />
              <Text style={styles.preferenceText}>{userSelections?.duration || 'Not specified'}</Text>
            </View>
          </View>
        </View>
        
        {/* Trip Summary */}
        {tripPlan.summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Trip Summary</Text>
            <Text style={styles.summaryText}>{tripPlan.summary}</Text>
          </View>
        )}
        
        {/* Day-by-Day Itinerary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Itinerary</Text>
          {tripPlan.itinerary.map((day) => (
            <ItineraryDayCard 
              key={day.day}
              day={day.day}
              activities={day.activities}
              weather={day.weather}
              morning={day.morning}
              afternoon={day.afternoon}
              evening={day.evening}
              isExpanded={expandedDay === day.day}
              onToggle={() => toggleDayExpansion(day.day)}
            />
          ))}
        </View>
        
        {/* Flight Details if available */}
        {tripPlan.flightDetails && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setFlightExpanded(!flightExpanded)}
            >
              <Text style={styles.sectionTitle}>Flight Details</Text>
              <Ionicons 
                name={flightExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6A11CB" 
              />
            </TouchableOpacity>
            
            {flightExpanded && (
              <View style={styles.flightDetails}>
                {/* Outbound Flight */}
                <View style={styles.flight}>
                  <View style={styles.flightHeader}>
                    <Ionicons name="airplane-outline" size={18} color="#6A11CB" />
                    <Text style={styles.flightHeaderText}>Outbound Flight</Text>
                  </View>
                  
                  <View style={styles.flightInfo}>
                    <View style={styles.flightTiming}>
                      <Text style={styles.flightTime}>{tripPlan.flightDetails?.outbound?.departureTime || 'N/A'}</Text>
                      <View style={styles.flightRoute}>
                        <View style={styles.flightDot} />
                        <View style={styles.flightLine} />
                        <View style={styles.flightDot} />
                      </View>
                      <Text style={styles.flightTime}>{tripPlan.flightDetails?.outbound?.arrivalTime || 'N/A'}</Text>
                    </View>
                    
                    <View style={styles.flightDetails}>
                      <Text style={styles.flightDetailText}>
                        {tripPlan.flightDetails?.outbound?.airline || 'Airline'} • {tripPlan.flightDetails?.outbound?.flightNumber || 'N/A'}
                      </Text>
                      <Text style={styles.flightDurationText}>{tripPlan.flightDetails?.outbound?.duration || 'Duration not available'}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.bookButton, styles.flightBookButton]}
                    onPress={() => handleBooking('flight')}
                  >
                    <Text style={styles.bookButtonText}>Book Flight</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Return Flight if available */}
                {tripPlan.flightDetails?.return && (
                  <View style={styles.flight}>
                    <View style={styles.flightHeader}>
                      <Ionicons name="airplane-outline" size={18} color="#6A11CB" style={{ transform: [{ rotate: '180deg' }] }} />
                      <Text style={styles.flightHeaderText}>Return Flight</Text>
                    </View>
                    
                    <View style={styles.flightInfo}>
                      <View style={styles.flightTiming}>
                        <Text style={styles.flightTime}>{tripPlan.flightDetails?.return?.departureTime || 'N/A'}</Text>
                        <View style={styles.flightRoute}>
                          <View style={styles.flightDot} />
                          <View style={styles.flightLine} />
                          <View style={styles.flightDot} />
                        </View>
                        <Text style={styles.flightTime}>{tripPlan.flightDetails?.return?.arrivalTime || 'N/A'}</Text>
                      </View>
                      
                      <View style={styles.flightDetails}>
                        <Text style={styles.flightDetailText}>
                          {tripPlan.flightDetails?.return?.airline || 'Airline'} • {tripPlan.flightDetails?.return?.flightNumber || 'N/A'}
                        </Text>
                        <Text style={styles.flightDurationText}>{tripPlan.flightDetails?.return?.duration || 'Duration not available'}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        
        {/* Accommodation Details if available */}
        {tripPlan.accommodation && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setHotelExpanded(!hotelExpanded)}
            >
              <Text style={styles.sectionTitle}>Accommodation</Text>
              <Ionicons 
                name={hotelExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6A11CB" 
              />
            </TouchableOpacity>
            
            {hotelExpanded && (
              <View style={styles.hotelContainer}>
                <Text style={styles.hotelName}>{tripPlan.accommodation?.name || 'Unnamed'}</Text>
                <Text style={styles.hotelType}>{tripPlan.accommodation?.type || 'Not specified'}</Text>
                
                {tripPlan.accommodation.image && (
                  <Image 
                    source={{ uri: tripPlan.accommodation.image }}
                    style={styles.hotelImage}
                    resizeMode="cover"
                  />
                )}
                
                <Text style={styles.hotelAddress}>{typeof tripPlan.accommodation?.address === 'object' ? JSON.stringify(tripPlan.accommodation?.address) : tripPlan.accommodation?.address || 'Address not available'}</Text>
                
                <View style={styles.hotelRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i}
                      name={tripPlan.accommodation && i < tripPlan.accommodation.rating ? "star" : "star-outline"} 
                      size={18} 
                      color={tripPlan.accommodation && i < tripPlan.accommodation.rating ? "#FFC107" : "#ccc"} 
                    />
                  ))}
                </View>
                
                <View style={styles.hotelAmenities}>
                  <Text style={styles.amenitiesTitle}>Amenities</Text>
                  <View style={styles.amenitiesList}>
                    {tripPlan.accommodation?.amenities?.map((amenity, index) => (
                      <View key={index} style={styles.amenityItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#5CDB95" />
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <Text style={styles.hotelPrice}>
                  <Text style={styles.hotelPriceValue}>{typeof tripPlan.accommodation?.price === 'object' ? JSON.stringify(tripPlan.accommodation?.price) : tripPlan.accommodation?.price || 'Price not available'}</Text> per night
                </Text>
                
                <TouchableOpacity 
                  style={[styles.bookButton, styles.hotelBookButton]}
                  onPress={() => handleBooking('hotel')}
                >
                  <Text style={styles.bookButtonText}>Book Stay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {/* Budget Summary if available */}
        {tripPlan.estimatedCosts && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setBudgetExpanded(!budgetExpanded)}
            >
              <Text style={styles.sectionTitle}>Budget Summary</Text>
              <Ionicons 
                name={budgetExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6A11CB" 
              />
            </TouchableOpacity>
            
            {budgetExpanded && (
              <View style={styles.budgetContent}>
                {/* Budget Pie Chart */}
                <View style={styles.chartContainer}>
                  <PieChart
                    data={getBudgetChartData()}
                    width={width - 60}
                    height={180}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      color: (opacity = 1) => `rgba(106, 17, 203, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="10"
                    absolute
                  />
                </View>
                
                {/* Budget Breakdown */}
                <View style={styles.budgetBreakdown}>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Accommodation</Text>
                    <Text style={styles.budgetValue}>{typeof tripPlan.estimatedCosts?.accommodation === 'object' ? JSON.stringify(tripPlan.estimatedCosts?.accommodation) : tripPlan.estimatedCosts?.accommodation || 'N/A'}</Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Food</Text>
                    <Text style={styles.budgetValue}>{typeof tripPlan.estimatedCosts?.food === 'object' ? JSON.stringify(tripPlan.estimatedCosts?.food) : tripPlan.estimatedCosts?.food || 'N/A'}</Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Activities</Text>
                    <Text style={styles.budgetValue}>{typeof tripPlan.estimatedCosts?.activities === 'object' ? JSON.stringify(tripPlan.estimatedCosts?.activities) : tripPlan.estimatedCosts?.activities || 'N/A'}</Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Transportation</Text>
                    <Text style={styles.budgetValue}>{typeof tripPlan.estimatedCosts?.transportation === 'object' ? JSON.stringify(tripPlan.estimatedCosts?.transportation) : tripPlan.estimatedCosts?.transportation || 'N/A'}</Text>
                  </View>
                  {tripPlan.estimatedCosts?.extras && (
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Extras</Text>
                      <Text style={styles.budgetValue}>{typeof tripPlan.estimatedCosts.extras === 'object' ? JSON.stringify(tripPlan.estimatedCosts.extras) : tripPlan.estimatedCosts.extras}</Text>
                    </View>
                  )}
                  <View style={[styles.budgetRow, styles.budgetTotal]}>
                    <Text style={styles.budgetTotalLabel}>Total Estimated</Text>
                    <Text style={styles.budgetTotalValue}>{typeof tripPlan.estimatedCosts?.total === 'object' ? JSON.stringify(tripPlan.estimatedCosts?.total) : tripPlan.estimatedCosts?.total || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Travel Tips */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Travel Tips</Text>
          {tripPlan.tips.map((tip, index) => (
            <TipCard key={index} tip={tip} />
          ))}
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleSaveTrip}
          >
            <Ionicons name="bookmark-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Save Trip</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleEditTrip}
            >
              <Ionicons name="create-outline" size={20} color="#6200ee" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleReplan}
            >
              <Ionicons name="refresh-outline" size={20} color="#6200ee" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Replan</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Extra space at the bottom for the floating footer */}
        <View style={{ height: 80 }} />
      </AnimatedScrollView>
      
      {/* Sticky Footer */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleExportPDF}
        >
          <Ionicons name="document-outline" size={20} color="#6A11CB" />
          <Text style={styles.footerButtonText}>PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleEditTrip}
        >
          <Ionicons name="build-outline" size={20} color="#6A11CB" />
          <Text style={styles.footerButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={20} color="#6A11CB" />
          <Text style={styles.footerButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <Text style={styles.feedbackTitle}>How's Your Trip Plan?</Text>
            <Text style={styles.feedbackSubtitle}>Help us improve our AI trip planner</Text>
            
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={5}
              placeholder="Share your thoughts on this trip plan..."
              value={feedback}
              onChangeText={setFeedback}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitFeedback}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6200ee',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stickyHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    paddingHorizontal: 10,
  },
  heroContainer: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  destinationInfo: {
    marginTop: 8,
  },
  destinationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  destinationSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    zIndex: 10,
  },
  preferencesContainer: {
    margin: 20,
    marginTop: -20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  preferenceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  preferenceText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6A11CB',
  },
  sectionContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  dayCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dayNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  weatherText: {
    fontSize: 12,
    color: '#0288d1',
  },
  dayContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  detailedSchedule: {
    paddingVertical: 8,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A11CB',
    marginBottom: 8,
  },
  activitiesList: {
    paddingVertical: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
    marginTop: 6,
    marginRight: 8,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#f0f0f7',
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flex: 1,
  },
  flightDetails: {
    marginTop: 10,
  },
  flight: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  flightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flightHeaderText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  flightInfo: {
    marginBottom: 16,
  },
  flightTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flightTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  flightRoute: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  flightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6A11CB',
  },
  flightLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  flightDetailText: {
    fontSize: 14,
    color: '#666',
  },
  flightDurationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  hotelContainer: {
    marginTop: 10,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  hotelType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  hotelImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  hotelRating: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hotelAmenities: {
    marginBottom: 16,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 6,
  },
  hotelPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  hotelPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A11CB',
  },
  bookButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  flightBookButton: {
    backgroundColor: '#6A11CB',
  },
  hotelBookButton: {
    backgroundColor: '#6A11CB',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  budgetContent: {
    marginTop: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetBreakdown: {
    marginTop: 10,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  budgetTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#eee',
    borderBottomWidth: 0,
  },
  budgetTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A11CB',
  },
  actionButtonsContainer: {
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButton: {
    backgroundColor: '#6200ee',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f7',
    marginHorizontal: 5,
  },
  secondaryButtonText: {
    color: '#6200ee',
    fontWeight: '500',
    fontSize: 14,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-around',
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
  },
  footerButtonText: {
    fontSize: 12,
    color: '#6A11CB',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedbackModal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  feedbackInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#6A11CB',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default AITripResultScreen; 