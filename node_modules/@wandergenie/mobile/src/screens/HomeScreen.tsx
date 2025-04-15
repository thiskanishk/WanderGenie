import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from '@reduxjs/toolkit';

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

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppThunkDispatch>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // New state variables from HomeScreen.js
  const [mode, setMode] = useState<'smart' | 'specific'>('smart');
  const [input, setInput] = useState<string>('');
  
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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>WanderGenie</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={mode === 'smart' 
            ? "Tell us your vibe, budget, duration…" 
            : "Where do you want to go?"}
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />
      </View>
      
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            mode === 'smart' && styles.activeToggle
          ]}
          onPress={() => setMode('smart')}
        >
          <Text style={[
            styles.toggleText,
            mode === 'smart' && styles.activeToggleText
          ]}>🎯 Smart Suggestion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            mode === 'specific' && styles.activeToggle
          ]}
          onPress={() => setMode('specific')}
        >
          <Text style={[
            styles.toggleText,
            mode === 'specific' && styles.activeToggleText
          ]}>📍 Specific Location</Text>
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
          {mode === 'smart' ? (
            <View style={styles.inputsContainer}>
              <Text style={styles.sectionTitle}>Tell us about your dream trip:</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Trip Type</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.option}>
                    <Text>Solo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>Couple</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>Family</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vibe</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.option}>
                    <Text>Adventure</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>Relax</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>Culture</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.option}>
                    <Text>Budget</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>Mid-range</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>Luxury</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.option}>
                    <Text>Weekend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>1 Week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option}>
                    <Text>2+ Weeks</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.locationContainer}>
              <Text style={styles.sectionTitle}>Find your perfect destination:</Text>
              <View style={styles.budgetTiers}>
                <TouchableOpacity style={styles.budgetTier}>
                  <Text style={styles.budgetTitle}>Budget</Text>
                  <Text style={styles.budgetDesc}>Affordable options with great value</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.budgetTier}>
                  <Text style={styles.budgetTitle}>Mid-Range</Text>
                  <Text style={styles.budgetDesc}>Balance of comfort and affordability</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.budgetTier}>
                  <Text style={styles.budgetTitle}>Luxury</Text>
                  <Text style={styles.budgetDesc}>Premium experiences and accommodations</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaText}>Find Destinations</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 10,
    paddingBottom: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
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
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
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
  aiPlannerSection: {
    marginBottom: 25,
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
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  destinationCountry: {
    fontSize: 14,
    color: '#666',
  },
  recentSearches: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentSearchText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  bottomSpacing: {
    height: 30,
  },
  contentContainer: {
    marginBottom: 25,
  },
  inputsContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    width: '30%',
  },
  locationContainer: {
    width: '100%',
  },
  budgetTiers: {
    marginBottom: 25,
  },
  budgetTier: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0077cc',
  },
  budgetDesc: {
    color: '#666',
  },
  ctaButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 