import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Smart Trip Planning',
    subtitle: 'Just tell us your vibe — AI will plan your perfect getaway',
    animation: require('../assets/lottie/ai.json'),
  },
  {
    key: '2',
    title: 'Personalized Itineraries',
    subtitle: 'Day-by-day plans tailored to your budget, style, and interests',
    animation: require('../assets/lottie/calendar.json'),
  },
  {
    key: '3',
    title: 'Save & Share Trips',
    subtitle: 'Invite travel partners, export to PDF, or save offline',
    animation: require('../assets/lottie/suitcase.json'),
  },
  {
    key: '4',
    title: 'Refine With Feedback',
    subtitle: 'Loved Day 1, but not Day 3? Replan it instantly!',
    animation: require('../assets/lottie/feedback.json'),
  },
  {
    key: '5',
    title: 'Ready to Explore?',
    subtitle: 'Let’s plan your first adventure!',
    animation: require('../assets/lottie/explore.json'),
  },
];

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [travelerType, setTravelerType] = useState('');
  const [dreamDestination, setDreamDestination] = useState('');
  const confettiRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowConfetti(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const handleSkip = () => {
    AsyncStorage.setItem('tour_shown', 'true');
    onComplete();
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <LottieView source={item.animation} autoPlay loop style={styles.animation} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderPersonalization = () => (
    <View style={styles.personalizationContainer}>
      <Text style={styles.personalizationTitle}>What kind of traveler are you?</Text>
      <View style={styles.chipsContainer}>
        {['Explorer', 'Relaxed', 'Luxe'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              travelerType === type && styles.activeChip,
            ]}
            onPress={() => setTravelerType(type)}
          >
            <Text
              style={[
                styles.chipText,
                travelerType === type && styles.activeChipText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.personalizationTitle}>Where do you dream of going?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your dream destination"
        value={dreamDestination}
        onChangeText={setDreamDestination}
      />
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          AsyncStorage.setItem('tour_shown', 'true');
          AsyncStorage.setItem('traveler_type', travelerType);
          AsyncStorage.setItem('dream_destination', dreamDestination);
          onComplete();
        }}
      >
        <Text style={styles.startButtonText}>Start Planning</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: height / 2 }}
          autoStart
          fadeOut
          ref={confettiRef}
        />
      )}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      {currentIndex < slides.length - 1 ? (
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          keyExtractor={(item) => item.key}
        />
      ) : (
        renderPersonalization()
      )}
      {currentIndex < slides.length - 1 && (
        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#007bff',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007bff',
  },
  nextButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
  },
  personalizationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  personalizationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  activeChip: {
    backgroundColor: '#007bff',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  activeChipText: {
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Onboarding;