import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Share
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define the trip plan type
interface TripPlan {
  destination: string;
  duration: string;
  budget: string;
  itinerary: {
    day: number;
    activities: string[];
  }[];
  tips: string[];
  estimatedCosts: {
    accommodation: string;
    food: string;
    activities: string;
    transportation: string;
    total: string;
  };
}

interface UserSelections {
  tripType: string;
  vibe: string;
  budget: string;
  duration: string;
}

type AIPlannerResultParams = {
  tripPlan: TripPlan;
  userSelections: UserSelections;
};

type AIPlannerResultScreenRouteProp = RouteProp<
  { AIPlannerResult: AIPlannerResultParams },
  'AIPlannerResult'
>;

const AIPlannerResultScreen = () => {
  const route = useRoute<AIPlannerResultScreenRouteProp>();
  const navigation = useNavigation();
  const { tripPlan, userSelections } = route.params;

  const handleShare = async () => {
    try {
      const message = `Check out my ${userSelections.tripType} trip to ${tripPlan.destination}! Generated with WanderGenie.`;
      await Share.share({
        message,
        title: 'My WanderGenie Trip Plan',
      });
    } catch (error) {
      console.error('Error sharing trip plan:', error);
    }
  };

  const handleSaveTrip = () => {
    // Here you would save the trip to the user's account
    // This would involve a Redux action or API call
    // For now, just navigate back home
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Destination */}
        <LinearGradient
          colors={['#6A11CB', '#2575FC']}
          style={styles.header}
        >
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationTitle}>{tripPlan.destination}</Text>
            <Text style={styles.destinationSubtitle}>{userSelections.duration} • {userSelections.budget}</Text>
          </View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Trip Preferences Summary */}
        <View style={styles.preferencesContainer}>
          <Text style={styles.sectionTitle}>Your Trip Preferences</Text>
          <View style={styles.preferencesGrid}>
            <View style={styles.preferenceItem}>
              <Ionicons name="map-outline" size={20} color="#6200ee" />
              <Text style={styles.preferenceLabel}>Trip Type</Text>
              <Text style={styles.preferenceValue}>{userSelections.tripType}</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Ionicons name="heart-outline" size={20} color="#6200ee" />
              <Text style={styles.preferenceLabel}>Vibe</Text>
              <Text style={styles.preferenceValue}>{userSelections.vibe}</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Ionicons name="cash-outline" size={20} color="#6200ee" />
              <Text style={styles.preferenceLabel}>Budget</Text>
              <Text style={styles.preferenceValue}>{userSelections.budget}</Text>
            </View>
            <View style={styles.preferenceItem}>
              <Ionicons name="time-outline" size={20} color="#6200ee" />
              <Text style={styles.preferenceLabel}>Duration</Text>
              <Text style={styles.preferenceValue}>{userSelections.duration}</Text>
            </View>
          </View>
        </View>
        
        {/* Day-by-Day Itinerary */}
        <View style={styles.itineraryContainer}>
          <Text style={styles.sectionTitle}>Your Itinerary</Text>
          {tripPlan.itinerary.map((day) => (
            <View key={day.day} style={styles.dayContainer}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>Day {day.day}</Text>
                <View style={styles.dayCircle}>
                  <Text style={styles.dayNumber}>{day.day}</Text>
                </View>
              </View>
              <View style={styles.activitiesList}>
                {day.activities.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityBullet} />
                    <Text style={styles.activityText}>{activity}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
        
        {/* Travel Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Travel Tips</Text>
          {tripPlan.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="information-circle-outline" size={20} color="#6200ee" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        
        {/* Estimated Budget */}
        <View style={styles.budgetContainer}>
          <Text style={styles.sectionTitle}>Estimated Budget</Text>
          <View style={styles.budgetBreakdown}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetCategory}>Accommodation</Text>
              <Text style={styles.budgetAmount}>{tripPlan.estimatedCosts.accommodation}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetCategory}>Food & Drinks</Text>
              <Text style={styles.budgetAmount}>{tripPlan.estimatedCosts.food}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetCategory}>Activities</Text>
              <Text style={styles.budgetAmount}>{tripPlan.estimatedCosts.activities}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetCategory}>Transportation</Text>
              <Text style={styles.budgetAmount}>{tripPlan.estimatedCosts.transportation}</Text>
            </View>
            <View style={[styles.budgetRow, styles.totalRow]}>
              <Text style={styles.totalCategory}>Total</Text>
              <Text style={styles.totalAmount}>{tripPlan.estimatedCosts.total}</Text>
            </View>
          </View>
        </View>
        
        {/* Save Trip Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveTrip}
          >
            <Ionicons name="bookmark-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Save This Trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  destinationInfo: {
    marginTop: 20,
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
    left: 20,
    zIndex: 10,
  },
  shareButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  preferencesContainer: {
    margin: 20,
    marginTop: -30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  preferenceItem: {
    width: '48%',
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itineraryContainer: {
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
  dayContainer: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dayNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activitiesList: {
    marginLeft: 8,
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
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  tipsContainer: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  budgetContainer: {
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
  budgetBreakdown: {
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetCategory: {
    fontSize: 16,
    color: '#333',
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  totalCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  buttonContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AIPlannerResultScreen; 