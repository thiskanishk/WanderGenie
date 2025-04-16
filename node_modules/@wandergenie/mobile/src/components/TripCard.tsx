import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../store/slices/tripsSlice';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onLongPress?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  style?: any;
}

const TripCard = ({ 
  trip, 
  onPress, 
  onLongPress,
  onEdit,
  onShare,
  onDelete,
  style 
}: TripCardProps) => {
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
  
  // Calculate days remaining until trip
  const getDaysRemaining = () => {
    const today = new Date();
    const start = new Date(trip.startDate);
    if (today > start) return null;
    
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };
  
  const daysRemaining = getDaysRemaining();

  return (
    <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View style={[styles.container, style]}>
        <TouchableOpacity style={styles.card} onPress={onPress}>
          <View style={styles.imageContainer}>
            <Image 
              source={trip.imageUrl ? { uri: trip.imageUrl } : require('../assets/placeholder.png')}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[
              styles.statusBadge, 
              trip.isDraft ? styles.draftBadge : styles.plannedBadge
            ]}>
              <Text style={styles.statusText}>
                {trip.isDraft ? '🟡 Draft' : '🟢 Planned'}
              </Text>
            </View>
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
              
              {trip.budget && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color="#666" />
                  <Text style={styles.detailText}>
                    {trip.budget.currency}{trip.budget.amount}
                  </Text>
                </View>
              )}
              
              {daysRemaining && !trip.isDraft && (
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingText}>{daysRemaining}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Quick Actions */}
          {(onEdit || onShare || onDelete) && (
            <View style={styles.quickActions}>
              {onEdit && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={onEdit}
                >
                  <Ionicons name="create-outline" size={18} color="#6200ee" />
                </TouchableOpacity>
              )}
              
              {onShare && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={onShare}
                >
                  <Ionicons name="share-social-outline" size={18} color="#6200ee" />
                </TouchableOpacity>
              )}
              
              {onDelete && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={onDelete}
                >
                  <Ionicons name="trash-outline" size={18} color="#f44336" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  draftBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  plannedBadge: {
    backgroundColor: 'rgba(75, 181, 67, 0.8)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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
  upcomingBadge: {
    marginTop: 8,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  upcomingText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2196f3',
  },
  quickActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
});

export default TripCard; 