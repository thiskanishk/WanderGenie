import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

/**
 * WelcomeHeader component displays a personalized greeting to the user
 */
const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  
  // Get the time of day for appropriate greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };
  
  // Get the first name from the user's full name
  const getFirstName = (): string => {
    if (!user || !user.fullName) return '';
    
    return user.fullName.split(' ')[0];
  };
  
  // Show emoji based on time of day
  const getGreetingEmoji = (): string => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return '☀️';
    } else if (hour < 18) {
      return '🌤️';
    } else {
      return '🌙';
    }
  };
  
  // If no user, return empty view
  if (!user) {
    return <View style={styles.container} />;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>
        {getGreeting()}, <Text style={styles.nameText}>{getFirstName()}</Text> {getGreetingEmoji()}
      </Text>
      <Text style={styles.subText}>What's your next adventure?</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  nameText: {
    fontWeight: '700',
    color: '#F97316', // Orange color for emphasis
  },
  subText: {
    fontSize: 16,
    color: '#666',
  }
});

export default WelcomeHeader; 