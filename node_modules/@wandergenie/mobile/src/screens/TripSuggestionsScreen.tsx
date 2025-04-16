import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { TripPlan, UserSelections } from '../types/tripTypes';
import { getFilteredTripOptions } from '../utils/mockTripPlans';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Card dimensions
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;
const CARD_MARGIN = width * 0.05;

// Create animated FlatList component
// This fixes "VirtualizedList must be wrapped with Animated.createAnimatedComponent" error
// when using Animated.event with onScroll
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface TripSuggestionsScreenParams {
  userSelections: UserSelections;
}

const TripSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as TripSuggestionsScreenParams || {};
  const { userSelections } = params;
  
  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [tripOptions, setTripOptions] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch trip options based on user selections
  useEffect(() => {
    setLoading(true);
    
    // Determine if we should use AI-generated options
    if (userSelections?.useAI === true) {
      // Use AI API to generate trip options
      fetch('/api/generate-trip-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSelections),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch AI trip options');
          }
          return response.json();
        })
        .then(data => {
          // Update trip options from API response
          setTripOptions(data.tripPlans);
          setLoading(false);
          
          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        })
        .catch(error => {
          console.error('Error fetching AI trip options:', error);
          
          // Fallback to mock data if API fails
          console.log('Falling back to mock trip options');
          const filteredOptions = getFilteredTripOptions(
            userSelections?.tripType,
            userSelections?.budget,
            userSelections?.duration
          );
          
          setTripOptions(filteredOptions);
          setLoading(false);
          
          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        });
    } else {
      // Use mock data for trip options (existing implementation)
      const loadingTimer = setTimeout(() => {
        const filteredOptions = getFilteredTripOptions(
          userSelections?.tripType,
          userSelections?.budget,
          userSelections?.duration
        );
        
        setTripOptions(filteredOptions);
        setLoading(false);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 1500);
      
      return () => clearTimeout(loadingTimer);
    }
  }, []);
  
  // Handle card selection
  const handleSelectTrip = (tripPlan: TripPlan) => {
    navigation.navigate('AITripResultScreen' as never, { 
      tripPlan,
      userSelections
    } as never);
  };
  
  // Go back to planning screen
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Refresh options
  const handleRefresh = () => {
    setLoading(true);
    
    // Fade out and in animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
    
    // Simulate refreshing trip options
    setTimeout(() => {
      // Shuffle array to simulate new options
      const newOptions = [...getFilteredTripOptions(
        userSelections?.tripType,
        userSelections?.budget,
        userSelections?.duration
      )].sort(() => Math.random() - 0.5);
      
      setTripOptions(newOptions);
      setLoading(false);
    }, 800);
  };
  
  // Render trip card
  const renderTripCard = ({ item }: { item: any }) => {
    const tripItem = item as TripPlan;
    return (
      <Animated.View 
        style={[
          styles.cardContainer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleSelectTrip(tripItem)}
        >
          <ImageBackground
            source={{ uri: tripItem.image }}
            style={styles.cardImage}
            imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardImageGradient}
            >
              <View style={styles.destinationContainer}>
                <Text style={styles.destinationText}>{tripItem.destination}</Text>
                <View style={styles.tripTypeChip}>
                  <Text style={styles.tripTypeText}>{tripItem.tripType}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
          
          <View style={styles.cardContent}>
            <Text style={styles.summaryText}>{tripItem.summary}</Text>
            
            <View style={styles.tripDetailsContainer}>
              <View style={styles.tripDetailItem}>
                <Ionicons name="time-outline" size={18} color="#6A11CB" />
                <Text style={styles.tripDetailText}>{tripItem.duration}</Text>
              </View>
              
              <View style={styles.tripDetailItem}>
                <Ionicons name="cash-outline" size={18} color="#6A11CB" />
                <Text style={styles.tripDetailText}>{tripItem.budget}</Text>
              </View>
              
              <View style={styles.tripDetailItem}>
                <Ionicons name="bed-outline" size={18} color="#6A11CB" />
                <Text style={styles.tripDetailText}>
                  {tripItem.accommodation?.type || 'Various Options'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => handleSelectTrip(tripItem)}
            >
              <Text style={styles.viewDetailsText}>View Full Itinerary</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Header animation values
  const headerOpacity = scrollX.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Trip Options</Text>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Main Content */}
      <LinearGradient
        colors={['#0D1B2A', '#1B263B', '#415A77']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Title and subtitle */}
          <View style={styles.titleContainer}>
            <TouchableOpacity 
              style={styles.backButtonTop}
              onPress={handleGoBack}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.title}>Your Trip Suggestions</Text>
            <Text style={styles.subtitle}>
              {loading
                ? 'Finding perfect destinations for you...'
                : `Based on your ${userSelections?.tripType || 'preferences'}`}
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Animated.View 
                style={[
                  styles.loadingIndicator,
                  {
                    transform: [{
                      rotate: scrollX.interpolate({
                        inputRange: [0, 1000],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              >
                <Ionicons name="planet-outline" size={50} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.loadingText}>Crafting perfect trips for you...</Text>
            </View>
          ) : (
            <AnimatedFlatList
              data={tripOptions}
              renderItem={renderTripCard}
              keyExtractor={(item: any) => (item as TripPlan).destination}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
              decelerationRate="fast"
              contentContainerStyle={styles.listContent}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            />
          )}
          
          {/* Refresh Button */}
          {!loading && (
            <TouchableOpacity 
              style={styles.refreshButtonBottom}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.refreshText}>More Options</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {/* User preferences summary */}
        {!loading && (
          <View style={styles.preferencesContainer}>
            <Text style={styles.preferencesTitle}>Your Preferences</Text>
            <View style={styles.preferencesChips}>
              {userSelections?.tripType && (
                <View style={styles.preferenceChip}>
                  <Ionicons name="map-outline" size={14} color="#6A11CB" />
                  <Text style={styles.preferenceChipText}>{userSelections.tripType}</Text>
                </View>
              )}
              
              {userSelections?.vibe && (
                <View style={styles.preferenceChip}>
                  <Ionicons name="heart-outline" size={14} color="#6A11CB" />
                  <Text style={styles.preferenceChipText}>{userSelections.vibe}</Text>
                </View>
              )}
              
              {userSelections?.budget && (
                <View style={styles.preferenceChip}>
                  <Ionicons name="cash-outline" size={14} color="#6A11CB" />
                  <Text style={styles.preferenceChipText}>{userSelections.budget}</Text>
                </View>
              )}
              
              {userSelections?.duration && (
                <View style={styles.preferenceChip}>
                  <Ionicons name="time-outline" size={14} color="#6A11CB" />
                  <Text style={styles.preferenceChipText}>{userSelections.duration}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(13, 27, 42, 0.9)',
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  titleContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  backButtonTop: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    height: CARD_HEIGHT,
  },
  cardImage: {
    height: CARD_HEIGHT * 0.55,
    resizeMode: 'cover',
  },
  cardImageGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  destinationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destinationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tripTypeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tripTypeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 22,
  },
  tripDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  tripDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  viewDetailsButton: {
    backgroundColor: '#6A11CB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  refreshButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 50,
    marginBottom: 20,
  },
  refreshText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  preferencesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  preferencesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  preferenceChipText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

export default TripSuggestionsScreen; 