import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../store/slices/tripsSlice';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  style?: any;
}

const TripCard = ({ trip, onPress, style }: TripCardProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate trip duration
  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={trip.imageUrl ? { uri: trip.imageUrl } : require('../assets/placeholder.png')}
          style={styles.image}
          resizeMode="contain"
        />
        {trip.isDraft && (
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>Draft</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>
        <Text style={styles.destination} numberOfLines={1}>{trip.destination}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{getDuration()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 16,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  draftBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  draftText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  destination: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  details: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default TripCard; 