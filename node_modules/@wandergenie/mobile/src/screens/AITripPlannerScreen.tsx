import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock trip plan data 
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

// AI Agents that will "work" on the trip plan
const AGENTS = [
  { id: 1, name: 'Destination Scout 🧭', task: 'Finding the perfect destination…' },
  { id: 2, name: 'Stay Planner 🛌', task: 'Picking ideal stays and hotels…' },
  { id: 3, name: 'Itinerary Crafter 📅', task: 'Designing a day-wise plan…' },
  { id: 4, name: 'Budget Analyst 💰', task: 'Optimizing your travel costs…' },
  { id: 5, name: 'Travel Tips Guru 🧳', task: 'Curating tips and recommendations…' }
];

// Fun travel facts to show while loading
const TRAVEL_FACTS = [
  "Did you know? The Maldives has 1,192 coral islands.",
  "Bali has over 50 stunning waterfalls hidden in its lush jungles.",
  "Japan has vending machines that sell everything from hot pizza to umbrellas.",
  "The Great Wall of China is over 13,000 miles long.",
  "Venice, Italy consists of 118 small islands connected by 400+ bridges.",
  "Costa Rica produces some of the world's best coffee beans.",
  "Iceland has more than 125 volcanic mountains.",
  "The Northern Lights can be seen from 9 different countries.",
  "Thailand has over 1,400 islands in its territory.",
  "New Zealand has more sheep than people - about 6 sheep per person!"
];

const AITripPlannerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  
  // States
  const [completedAgents, setCompletedAgents] = useState<number[]>([]);
  const [currentFact, setCurrentFact] = useState(0);
  const [factOpacity] = useState(new Animated.Value(0));
  const [planReady, setPlanReady] = useState(false);
  const [readyOpacity] = useState(new Animated.Value(0));
  
  // Complete each agent in sequence
  useEffect(() => {
    // Fade in the screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Animate title
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Complete agents one by one
    AGENTS.forEach((agent, index) => {
      setTimeout(() => {
        setCompletedAgents(prev => [...prev, agent.id]);
        
        // If all agents are complete, show completion state
        if (index === AGENTS.length - 1) {
          setTimeout(() => {
            setPlanReady(true);
            Animated.timing(readyOpacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }, 1200);
        }
      }, 2000 + (index * 1800)); // Stagger the completion of each agent
    });
    
    // Rotate through facts every 5 seconds
    const factInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(factOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(factOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
      
      setCurrentFact(prev => (prev + 1) % TRAVEL_FACTS.length);
    }, 5000);
    
    // Show first fact
    Animated.timing(factOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    return () => clearInterval(factInterval);
  }, []);
  
  // Calculate progress
  const progress = completedAgents.length / AGENTS.length;
  
  // Navigate to trip suggestions
  const viewTripPlan = () => {
    navigation.navigate('TripSuggestionsScreen' as never, { 
      userSelections: params
    } as never);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D1B2A', '#1B263B', '#415A77']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Animated background dots/stars effect */}
        {Array(20).fill(0).map((_, i) => (
          <View 
            key={i}
            style={[
              styles.star,
              {
                top: Math.random() * Dimensions.get('window').height,
                left: Math.random() * Dimensions.get('window').width,
                opacity: Math.random() * 0.5 + 0.25,
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
              }
            ]}
          />
        ))}
      </Animated.View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: titleAnim,
              transform: [{ translateY: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}]
            }
          ]}
        >
          <Text style={styles.title}>
            {planReady 
              ? "Your perfect trip is ready!" 
              : "Hang tight! Our AI agents are working on your trip"}
          </Text>
          <Text style={styles.subtitle}>
            {planReady 
              ? "Get ready for an amazing adventure" 
              : "This will just take a few seconds..."}
          </Text>
        </Animated.View>
        
        {/* Travel fact bubble */}
        <Animated.View style={[styles.factBubble, { opacity: factOpacity }]}>
          <Text style={styles.factText}>{TRAVEL_FACTS[currentFact]}</Text>
        </Animated.View>
        
        {/* AI Agent Cards */}
        {!planReady && (
          <View style={styles.agentsContainer}>
            {AGENTS.map((agent) => {
              const isComplete = completedAgents.includes(agent.id);
              return (
                <View key={agent.id} style={[
                  styles.agentCard,
                  isComplete && styles.agentCardComplete
                ]}>
                  <View style={styles.agentIconContainer}>
                    <Text style={styles.agentIcon}>{agent.name.split(' ').pop()}</Text>
                  </View>
                  <View style={styles.agentContent}>
                    <Text style={styles.agentName}>{agent.name.split(' ')[0]}</Text>
                    <Text style={styles.agentTask}>{agent.task}</Text>
                  </View>
                  <View style={styles.agentStatus}>
                    {isComplete ? (
                      <Ionicons name="checkmark-circle" size={24} color="#5CDB95" />
                    ) : (
                      <ActivityIndicator size="small" color="#5CDB95" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Trip Ready Animation */}
        {planReady && (
          <Animated.View style={[styles.readyContainer, { opacity: readyOpacity }]}>
            <View style={styles.readyIconContainer}>
              <Ionicons name="paper-plane" size={60} color="#5CDB95" />
            </View>
            <Text style={styles.readyTitle}>Adventure Awaits!</Text>
            <Text style={styles.readyDescription}>
              We've crafted a personalized itinerary based on your preferences.
              Get ready to experience the trip of a lifetime!
            </Text>
            <TouchableOpacity style={styles.viewTripButton} onPress={viewTripPlan}>
              <Text style={styles.viewTripButtonText}>View My Trip</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Progress Indicator */}
      {!planReady && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedAgents.length} of {AGENTS.length} agents completed
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingBottom: 100, // Make room for progress indicator
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#5CDB95',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E1DD',
    textAlign: 'center',
  },
  factBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
    borderLeftWidth: 3,
    borderColor: '#5CDB95',
  },
  factText: {
    color: '#E0E1DD',
    fontSize: 16,
    fontStyle: 'italic',
  },
  agentsContainer: {
    marginTop: 20,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 38, 59, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderColor: '#5CDB95',
  },
  agentCardComplete: {
    backgroundColor: 'rgba(27, 38, 59, 0.9)',
    borderColor: '#5CDB95',
  },
  agentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(92, 219, 149, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentIcon: {
    fontSize: 20,
  },
  agentContent: {
    flex: 1,
  },
  agentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  agentTask: {
    color: '#ccc',
    fontSize: 14,
  },
  agentStatus: {
    marginLeft: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.8)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5CDB95',
    borderRadius: 4,
  },
  progressText: {
    color: '#E0E1DD',
    fontSize: 14,
    textAlign: 'center',
  },
  readyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  readyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(92, 219, 149, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  readyDescription: {
    fontSize: 16,
    color: '#E0E1DD',
    textAlign: 'center',
    marginBottom: 30,
  },
  viewTripButton: {
    backgroundColor: '#5CDB95',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#5CDB95',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  viewTripButtonText: {
    color: '#0D1B2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AITripPlannerScreen; 