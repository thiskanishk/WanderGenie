import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env'; // Make sure to install react-native-dotenv

import { fetchTrips, Trip } from '../store/slices/tripsSlice';
import { useAppSelector } from '../hooks/reduxHooks';
import TripCard from '../components/TripCard';
import SearchBar from '../components/SearchBar';
import BigActionButton from '../components/BigActionButton';

// Define types
type HomeScreenNavigationProp = any; // Use 'any' as a temporary workaround for StackNavigationProp issue
type AppThunkDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

interface FeaturedDestination {
  id: string;
  name: string;
  country: string;
  image: string;
}

interface AuthState {
  user?: {
    firstName?: string;
  };
}

interface TripsState {
  trips: Trip[];
  isLoading: boolean;
}

interface RootState {
  auth: AuthState;
  trips: TripsState;
}

// Trip types
type TripType = 'Beach' | 'City' | 'Mountain' | 'Cultural' | 'Adventure';
type TripVibe = 'Relaxing' | 'Party' | 'Family' | 'Romantic' | 'Solo';
type TripBudget = 'Budget' | 'Mid-Range' | 'Luxury';
type TripDuration = '1-3 Days' | '4-7 Days' | '1-2 Weeks' | '2+ Weeks';

// Popular destinations for autocomplete
const POPULAR_DESTINATIONS = [
  { id: '1', name: 'Paris', country: 'France' },
  { id: '2', name: 'Bali', country: 'Indonesia' },
  { id: '3', name: 'Tokyo', country: 'Japan' },
  { id: '4', name: 'New York', country: 'USA' },
  { id: '5', name: 'Barcelona', country: 'Spain' },
  { id: '6', name: 'Dubai', country: 'UAE' },
  { id: '7', name: 'Santorini', country: 'Greece' },
  { id: '8', name: 'London', country: 'UK' },
];

// Mock destination details
const DESTINATION_DETAILS = {
  'Paris': {
    weather: 'Mild, 15-25°C in summer',
    visa: 'Schengen visa required for most non-EU citizens',
    budget: '€100-150 per day',
    attractions: 'Eiffel Tower, Louvre, Notre Dame',
  },
  'Bali': {
    weather: 'Tropical, 26-33°C year-round',
    visa: 'Visa-free for many countries (30 days)',
    budget: '$50-100 per day',
    attractions: 'Beaches, Temples, Rice Terraces',
  },
  'Tokyo': {
    weather: 'Seasonal, hot summers, cold winters',
    visa: 'Required for most countries',
    budget: '$100-200 per day',
    attractions: 'Mount Fuji, Imperial Palace, Shibuya Crossing',
  },
  'New York': {
    weather: 'Seasonal, hot summers, cold winters',
    visa: 'US visa or ESTA required',
    budget: '$150-300 per day',
    attractions: 'Times Square, Central Park, Empire State Building',
  },
  'Barcelona': {
    weather: 'Mediterranean, warm summers',
    visa: 'Schengen visa required for most non-EU citizens',
    budget: '€80-150 per day',
    attractions: 'Sagrada Familia, Park Güell, Gothic Quarter',
  },
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppThunkDispatch>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // States for selected tab and form inputs
  const [activeTab, setActiveTab] = useState<'smart' | 'specific'>('smart');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTripType, setSelectedTripType] = useState<TripType | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<TripVibe | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<TripBudget | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<TripDuration | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  
  // States for specific location tab
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  
  // Get trips from Redux store
  const { trips, isLoading } = useAppSelector((state: RootState) => state.trips);
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  // Filter for upcoming trips only
  const upcomingTrips = trips.filter((trip: Trip) => {
    const today = new Date();
    const startDate = new Date(trip.startDate);
    return startDate >= today;
  });
  
  // Get featured destinations (would come from an API in a real app)
  const featuredDestinations: FeaturedDestination[] = [
    { id: '1', name: 'Paris', country: 'France', image: 'https://example.com/paris.jpg' },
    { id: '2', name: 'Tokyo', country: 'Japan', image: 'https://example.com/tokyo.jpg' },
    { id: '3', name: 'New York', country: 'USA', image: 'https://example.com/newyork.jpg' },
  ];
  
  useEffect(() => {
    // Fetch trips when component mounts
    dispatch(fetchTrips());
  }, [dispatch]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTrips());
    setRefreshing(false);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, you would dispatch a search action or filter locally
  };
  
  const navigateToAIPlanner = () => {
    navigation.navigate('AIPlanner' as never);
  };
  
  const navigateToTripDetail = (tripId: string) => {
    navigation.navigate('TripDetail' as never, { tripId } as never);
  };
  
  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Animation for tab changes
  useEffect(() => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset form values when switching tabs
    if (activeTab === 'smart') {
      setCurrentStep(1);
      setSelectedTripType(null);
      setSelectedVibe(null);
      setSelectedBudget(null);
      setSelectedDuration(null);
    } else {
      setSearchQuery('');
      setSelectedDestination(null);
      setShowSuggestions(false);
    }
  }, [activeTab]);
  
  // Switch to next step in smart suggestion
  const goToNextStep = () => {
    if (currentStep < 4) {
      // Animate step transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        // Reset animation values and animate in the new step
        fadeAnim.setValue(0);
        slideAnim.setValue(30);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };
  
  // Switch to previous step in smart suggestion
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Generate trip plan based on selections
  const generateSmartPlan = async () => {
    if (!selectedTripType || !selectedVibe || !selectedBudget || !selectedDuration) {
      return; // Don't proceed if any selection is missing
    }
    
    // Set loading state
    setIsGeneratingPlan(true);
    
    try {
      // Call the backend API to generate the trip plan
      // Replace 192.168.1.4 with your actual local IP address
      const response = await fetch("http://192.168.1.4:3001/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tripType: selectedTripType, 
          vibe: selectedVibe, 
          budget: selectedBudget, 
          duration: selectedDuration 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(
          errorData.error || `Server responded with status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('Received trip plan from backend:', data.tripPlan.destination);
      
      // Navigate to results screen with the trip plan data
      navigation.navigate('AIPlannerResult', { 
        tripPlan: data.tripPlan,
        userSelections: data.userSelections
      });
    } catch (error: any) {
      console.error('Failed to generate trip plan:', error);
      Alert.alert(
        'Generation Failed',
        `We couldn't generate your trip plan: ${error.message || 'Unknown error'}. Please check your network connection and try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  
  // Plan trip based on selected destination
  const planSpecificTrip = () => {
    if (selectedDestination) {
      navigation.navigate('AIPlanner', {
        destination: selectedDestination,
      });
    }
  };
  
  // Filter destinations based on search query
  const filteredDestinations = POPULAR_DESTINATIONS.filter(
    dest => 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Selection card component for smart suggestions
  const SelectionCard = ({ 
    title, 
    isSelected, 
    onSelect 
  }: { 
    title: string; 
    isSelected: boolean; 
    onSelect: () => void 
  }) => (
    <TouchableOpacity
      style={[styles.selectionCard, isSelected && styles.selectedCard]}
      onPress={onSelect}
    >
      <Text style={[styles.selectionCardText, isSelected && styles.selectedCardText]}>
        {title}
      </Text>
      {isSelected && (
        <View style={styles.checkmarkContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
  
  // Render progress steps for smart suggestion
  const renderProgressSteps = () => (
    <View style={styles.progressContainer}>
      {['Trip Type', 'Vibe', 'Budget', 'Duration'].map((step, index) => (
        <View key={step} style={styles.progressStepWrapper}>
          <View 
            style={[
              styles.progressStep, 
              index + 1 <= currentStep && styles.activeProgressStep,
              index + 1 === currentStep && styles.currentProgressStep
            ]}
          >
            <Text style={[
              styles.progressStepNumber, 
              index + 1 <= currentStep && styles.activeProgressStepNumber
            ]}>
              {index + 1}
            </Text>
          </View>
          <Text style={[
            styles.progressStepText,
            index + 1 <= currentStep && styles.activeProgressStepText,
            index + 1 === currentStep && styles.currentProgressStepText
          ]}>
            {step}
          </Text>
          {index < 3 && (
            <View style={[
              styles.progressLine,
              index + 1 < currentStep && styles.activeProgressLine
            ]} />
          )}
        </View>
      ))}
    </View>
  );
  
  // Render smart suggestion form based on current step
  const renderSmartSuggestionForm = () => (
    <Animated.View style={[
      styles.formContainer,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      {renderProgressSteps()}
      
      <View style={styles.stepContent}>
        {currentStep === 1 && (
          <>
            <Text style={styles.stepTitle}>What type of trip are you looking for?</Text>
            <View style={styles.selectionGrid}>
              {(['Beach', 'City', 'Mountain', 'Cultural', 'Adventure'] as TripType[]).map((type) => (
                <SelectionCard
                  key={type}
                  title={type}
                  isSelected={selectedTripType === type}
                  onSelect={() => setSelectedTripType(type)}
                />
              ))}
            </View>
          </>
        )}
        
        {currentStep === 2 && (
          <>
            <Text style={styles.stepTitle}>What vibe are you going for?</Text>
            <View style={styles.selectionGrid}>
              {(['Relaxing', 'Party', 'Family', 'Romantic', 'Solo'] as TripVibe[]).map((vibe) => (
                <SelectionCard
                  key={vibe}
                  title={vibe}
                  isSelected={selectedVibe === vibe}
                  onSelect={() => setSelectedVibe(vibe)}
                />
              ))}
            </View>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <Text style={styles.stepTitle}>What's your budget?</Text>
            <View style={styles.selectionGrid}>
              {(['Budget', 'Mid-Range', 'Luxury'] as TripBudget[]).map((budget) => (
                <SelectionCard
                  key={budget}
                  title={budget}
                  isSelected={selectedBudget === budget}
                  onSelect={() => setSelectedBudget(budget)}
                />
              ))}
            </View>
          </>
        )}
        
        {currentStep === 4 && (
          <>
            <Text style={styles.stepTitle}>How long will your trip be?</Text>
            <View style={styles.selectionGrid}>
              {(['1-3 Days', '4-7 Days', '1-2 Weeks', '2+ Weeks'] as TripDuration[]).map((duration) => (
                <SelectionCard
                  key={duration}
                  title={duration}
                  isSelected={selectedDuration === duration}
                  onSelect={() => setSelectedDuration(duration)}
                />
              ))}
            </View>
          </>
        )}
      </View>
      
      <View style={styles.navigationButtonsContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousStep}
          >
            <Ionicons name="arrow-back" size={20} color="#6200ee" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < 4 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              (currentStep === 1 && !selectedTripType) ||
              (currentStep === 2 && !selectedVibe) ||
              (currentStep === 3 && !selectedBudget)
                ? styles.disabledButton
                : null
            ]}
            onPress={goToNextStep}
            disabled={
              (currentStep === 1 && !selectedTripType) ||
              (currentStep === 2 && !selectedVibe) ||
              (currentStep === 3 && !selectedBudget)
            }
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          isGeneratingPlan ? (
            <View style={styles.generateButton}>
              <ActivityIndicator color="#fff" size="small" style={{marginRight: 8}} />
              <Text style={styles.generateButtonText}>Generating Trip...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.generateButton,
                !selectedDuration ? styles.disabledButton : null
              ]}
              onPress={generateSmartPlan}
              disabled={!selectedDuration}
            >
              <Text style={styles.generateButtonText}>✨ Generate Smart Plan</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      
      {/* Journey summary when all selections are made */}
      {selectedTripType && selectedVibe && selectedBudget && selectedDuration && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Journey Preferences</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="map-outline" size={16} color="#6200ee" />
              <Text style={styles.summaryLabel}>Trip Type</Text>
              <Text style={styles.summaryValue}>{selectedTripType}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="heart-outline" size={16} color="#6200ee" />
              <Text style={styles.summaryLabel}>Vibe</Text>
              <Text style={styles.summaryValue}>{selectedVibe}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash-outline" size={16} color="#6200ee" />
              <Text style={styles.summaryLabel}>Budget</Text>
              <Text style={styles.summaryValue}>{selectedBudget}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={16} color="#6200ee" />
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{selectedDuration}</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
  
  // Render destination search for specific location
  const renderSpecificLocationSearch = () => (
    <Animated.View style={[
      styles.formContainer,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel}>Search for a destination</Text>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6200ee" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Try Paris, Bali, Tokyo..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(true);
              setSelectedDestination(null);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedDestination(null);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {showSuggestions && searchQuery.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSelectedDestination(destination.name);
                    setSearchQuery(`${destination.name}, ${destination.country}`);
                    setShowSuggestions(false);
                  }}
                >
                  <Ionicons name="location" size={16} color="#6200ee" />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName}>{destination.name}</Text>
                    <Text style={styles.suggestionCountry}>{destination.country}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResultsText}>No destinations found</Text>
            )}
          </View>
        )}
      </View>
      
      {selectedDestination && DESTINATION_DETAILS[selectedDestination as keyof typeof DESTINATION_DETAILS] && (
        <View style={styles.destinationDetails}>
          <Text style={styles.destinationName}>{selectedDestination}</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="sunny" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Weather</Text>
              <Text style={styles.detailText}>
                {DESTINATION_DETAILS[selectedDestination as keyof typeof DESTINATION_DETAILS].weather}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="card" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Visa</Text>
              <Text style={styles.detailText}>
                {DESTINATION_DETAILS[selectedDestination as keyof typeof DESTINATION_DETAILS].visa}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailText}>
                {DESTINATION_DETAILS[selectedDestination as keyof typeof DESTINATION_DETAILS].budget}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Attractions</Text>
              <Text style={styles.detailText}>
                {DESTINATION_DETAILS[selectedDestination as keyof typeof DESTINATION_DETAILS].attractions}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.planTripButton}
            onPress={planSpecificTrip}
          >
            <Text style={styles.planTripButtonText}>✨ Plan this Trip</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandContainer}>
            <Ionicons name="compass" size={24} color="#6200ee" />
            <Text style={styles.heading}>WanderGenie</Text>
          </View>
          <Text style={styles.greeting}>
            Hi {user?.firstName || 'Traveler'}!
          </Text>
          <Text style={styles.subtitle}>Where to next?</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>
      
      {/* Toggle Tabs */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'smart' && styles.activeToggle
          ]}
          onPress={() => setActiveTab('smart')}
        >
          <Text style={[
            styles.toggleText,
            activeTab === 'smart' && styles.activeToggleText
          ]}>
            Smart Suggestion
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'specific' && styles.activeToggle
          ]}
          onPress={() => setActiveTab('specific')}
        >
          <Text style={[
            styles.toggleText,
            activeTab === 'specific' && styles.activeToggleText
          ]}>
            Specific Location
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Conditional Content based on mode */}
        <View style={styles.contentContainer}>
          {activeTab === 'smart' ? renderSmartSuggestionForm() : renderSpecificLocationSearch()}
        </View>
        
        {/* AI Trip Planner */}
        <View style={styles.aiPlannerSection}>
          <BigActionButton
            title="Smart Trip Planner"
            subtitle="Generate personalized itineraries with AI"
            icon="sparkles-outline"
            onPress={navigateToAIPlanner}
            gradient={['#6A11CB', '#2575FC']}
          />
        </View>
        
        {/* Upcoming Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : upcomingTrips.length > 0 ? (
            <FlatList
              data={upcomingTrips.slice(0, 3)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }: { item: Trip }) => (
                <TripCard
                  trip={item}
                  onPress={() => navigateToTripDetail(item.id)}
                  style={styles.tripCard}
                />
              )}
              keyExtractor={(item: Trip) => item.id}
              contentContainerStyle={styles.tripsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="airplane-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No upcoming trips</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={navigateToAIPlanner}
              >
                <Text style={styles.createButtonText}>Plan a Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Featured Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Destinations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Explore</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={featuredDestinations}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }: { item: FeaturedDestination }) => (
              <TouchableOpacity style={styles.destinationCard}>
                <View style={styles.destinationImageContainer}>
                  <Image 
                    source={item.image ? { uri: item.image } : require('../assets/placeholder.png')}
                    style={styles.destinationImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.destinationName}>{item.name}</Text>
                <Text style={styles.destinationCountry}>{item.country}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item: FeaturedDestination) => item.id}
            contentContainerStyle={styles.destinationsList}
          />
        </View>
        
        {/* Recent Searches/History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recentSearches}>
            <TouchableOpacity style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={16} color="#6200ee" />
              <Text style={styles.recentSearchText}>Barcelona, Spain</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recentSearchItem}>
              <Ionicons name="time-outline" size={16} color="#6200ee" />
              <Text style={styles.recentSearchText}>Bali, Indonesia</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 6,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '500',
    color: '#666',
  },
  activeToggle: {
    backgroundColor: '#d0ebff',
    borderWidth: 0,
  },
  activeToggleText: {
    color: '#0077cc',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressStepWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeProgressStep: {
    backgroundColor: '#6200ee',
  },
  currentProgressStep: {
    borderWidth: 2,
    borderColor: '#6200ee',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  progressStepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
  },
  activeProgressStepNumber: {
    color: '#fff',
  },
  progressStepText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  activeProgressStepText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  currentProgressStepText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressLine: {
    position: 'absolute',
    top: 14,
    right: '50%',
    left: '50%',
    height: 2,
    backgroundColor: '#f0f0f0',
    zIndex: -1,
  },
  activeProgressLine: {
    backgroundColor: '#6200ee',
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#6200ee',
  },
  selectionCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedCardText: {
    color: '#fff',
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#6200ee',
    fontWeight: '500',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 4,
  },
  generateButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionTextContainer: {
    marginLeft: 8,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  suggestionCountry: {
    fontSize: 12,
    color: '#666',
  },
  noResultsText: {
    padding: 12,
    textAlign: 'center',
    color: '#999',
  },
  destinationDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  destinationName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  planTripButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  planTripButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  tripsList: {
    paddingRight: 20,
  },
  tripCard: {
    marginRight: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  destinationsList: {
    paddingRight: 20,
  },
  destinationCard: {
    width: 160,
    marginRight: 15,
  },
  destinationImageContainer: {
    width: 160,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationCountry: {
    fontSize: 12,
    color: '#666',
  },
  recentSearches: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentSearchText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  bottomSpacing: {
    height: 40,
  },
  contentContainer: {
    marginBottom: 25,
  },
  aiPlannerSection: {
    marginBottom: 25,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    flexDirection: 'column',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen; 