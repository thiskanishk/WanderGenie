import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AITripPlannerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || {};
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Trip Planner</Text>
          <Text style={styles.subtitle}>Your personalized itinerary</Text>
        </View>
        
        <View style={styles.paramsContainer}>
          <Text style={styles.sectionTitle}>Your Trip Preferences</Text>
          
          {params.tripType && (
            <View style={styles.paramItem}>
              <Ionicons name="map-outline" size={24} color="#6200ee" />
              <View style={styles.paramTextContainer}>
                <Text style={styles.paramLabel}>Trip Type</Text>
                <Text style={styles.paramValue}>{params.tripType}</Text>
              </View>
            </View>
          )}
          
          {params.vibe && (
            <View style={styles.paramItem}>
              <Ionicons name="heart-outline" size={24} color="#6200ee" />
              <View style={styles.paramTextContainer}>
                <Text style={styles.paramLabel}>Vibe</Text>
                <Text style={styles.paramValue}>{params.vibe}</Text>
              </View>
            </View>
          )}
          
          {params.budget && (
            <View style={styles.paramItem}>
              <Ionicons name="cash-outline" size={24} color="#6200ee" />
              <View style={styles.paramTextContainer}>
                <Text style={styles.paramLabel}>Budget</Text>
                <Text style={styles.paramValue}>{params.budget}</Text>
              </View>
            </View>
          )}
          
          {params.duration && (
            <View style={styles.paramItem}>
              <Ionicons name="time-outline" size={24} color="#6200ee" />
              <View style={styles.paramTextContainer}>
                <Text style={styles.paramLabel}>Duration</Text>
                <Text style={styles.paramValue}>{params.duration}</Text>
              </View>
            </View>
          )}
          
          {params.destination && (
            <View style={styles.paramItem}>
              <Ionicons name="location-outline" size={24} color="#6200ee" />
              <View style={styles.paramTextContainer}>
                <Text style={styles.paramLabel}>Destination</Text>
                <Text style={styles.paramValue}>{params.destination}</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.generatingSection}>
          <Text style={styles.generatingText}>Generating your perfect trip...</Text>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar} />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  paramsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  paramItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  paramTextContainer: {
    marginLeft: 12,
  },
  paramLabel: {
    fontSize: 14,
    color: '#666',
  },
  paramValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  generatingSection: {
    padding: 20,
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 16,
    color: '#6200ee',
    marginBottom: 12,
  },
  loadingContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '60%',
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  backButton: {
    margin: 20,
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AITripPlannerScreen; 