import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

// Import actual screens
import HomeScreen from '../screens/HomeScreen';
import AITripPlannerScreen from '../screens/AITripPlannerScreen';
import AITripResultScreen from '../screens/AITripResultScreen';
import SavedTripsScreen from '../screens/SavedTripsScreen';
import TripSuggestionsScreen from '../screens/TripSuggestionsScreen';
import MyProfileScreen from '../screens/MyProfileScreen';

// Create placeholder components for missing screens
const PlaceholderScreen: React.FC = () => null;

// Use placeholders for missing screens
const TripDetailScreen = PlaceholderScreen;
const ChecklistScreen = PlaceholderScreen;
const ShareTripScreen = PlaceholderScreen;
const SettingsScreen = PlaceholderScreen;

// Define navigation types
export type HomeStackParamList = {
  Home: undefined;
  AIPlanner: undefined;
  AITripPlannerScreen: {
    userSelections?: {
      tripType: string;
      vibe: string;
      budget: string;
      duration: string;
    }
  };
  TripSuggestionsScreen: { userSelections: any };
  AITripResultScreen: { 
    tripPlan?: any;
    userSelections?: any;
  };
  TripDetail: { tripId: string };
  Checklist: { tripId: string };
  ShareTrip: { tripId: string };
  SavedTrips: { tripPlanSummary?: any };
};

export type TripsStackParamList = {
  Trips: undefined;
  TripDetail: { tripId: string };
  ShareTrip: { tripId: string };
  EditTrip: { tripId: string };
  AIPlanner: undefined;
  AITripPlannerScreen: {
    userSelections?: {
      tripType: string;
      vibe: string;
      budget: string;
      duration: string;
    }
  };
  TripSuggestionsScreen: { userSelections: any };
  SavedTrips: { tripPlanSummary?: any };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  AIPlanner: undefined;
  AITripPlannerScreen: {
    userSelections?: {
      tripType: string;
      vibe: string;
      budget: string;
      duration: string;
    }
  };
  TripSuggestionsScreen: { userSelections: any };
  AITripResultScreen: { 
    tripPlan?: any;
    userSelections?: any;
  };
  SavedTrips: { tripPlanSummary?: any };
};

export type AppTabParamList = {
  HomeStack: undefined;
  TripsStack: undefined;
  ProfileStack: undefined;
};

// Create navigators
const HomeStack = createStackNavigator<HomeStackParamList>();
const TripsStack = createStackNavigator<TripsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Home stack
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="AIPlanner" 
        component={AITripPlannerScreen} 
        options={{ title: 'AI Trip Planner' }}
      />
      <HomeStack.Screen 
        name="AITripPlannerScreen" 
        component={AITripPlannerScreen} 
        options={{ title: 'AI Trip Planner' }}
      />
      <HomeStack.Screen 
        name="TripSuggestionsScreen" 
        component={TripSuggestionsScreen} 
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="AITripResultScreen" 
        component={AITripResultScreen} 
        options={{ 
          headerShown: false,
        }} 
      />
      <HomeStack.Screen 
        name="TripDetail" 
        component={TripDetailScreen} 
        options={({ route }) => ({ title: 'Trip Details' })}
      />
      <HomeStack.Screen 
        name="Checklist" 
        component={ChecklistScreen} 
        options={{ title: 'Trip Checklist' }}
      />
      <HomeStack.Screen 
        name="ShareTrip" 
        component={ShareTripScreen} 
        options={{ title: 'Share Trip' }}
      />
      <HomeStack.Screen 
        name="SavedTrips" 
        component={SavedTripsScreen} 
        options={{ title: 'My Trips' }}
      />
    </HomeStack.Navigator>
  );
}

// Trips stack
function TripsStackNavigator() {
  return (
    <TripsStack.Navigator>
      <TripsStack.Screen 
        name="Trips" 
        component={SavedTripsScreen} 
        options={{ headerShown: false }}
      />
      <TripsStack.Screen 
        name="TripDetail" 
        component={TripDetailScreen} 
        options={({ route }) => ({ title: 'Trip Details' })}
      />
      <TripsStack.Screen 
        name="ShareTrip" 
        component={ShareTripScreen} 
        options={{ title: 'Share Trip' }}
      />
      <TripsStack.Screen
        name="EditTrip"
        component={TripDetailScreen}
        options={{ title: 'Edit Trip' }}
      />
      <TripsStack.Screen 
        name="AIPlanner" 
        component={AITripPlannerScreen} 
        options={{ title: 'AI Trip Planner' }}
      />
      <TripsStack.Screen 
        name="AITripPlannerScreen" 
        component={AITripPlannerScreen} 
        options={{ title: 'AI Trip Planner' }}
      />
      <TripsStack.Screen 
        name="TripSuggestionsScreen" 
        component={TripSuggestionsScreen} 
        options={{ headerShown: false }}
      />
      <TripsStack.Screen 
        name="SavedTrips" 
        component={SavedTripsScreen} 
        options={{ title: 'My Trips' }}
      />
    </TripsStack.Navigator>
  );
}

// Profile stack
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="Profile" 
        component={MyProfileScreen} 
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </ProfileStack.Navigator>
  );
}

// Main tab navigator
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-circle-outline';

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TripsStack') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'ProfileStack') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="TripsStack" 
        component={TripsStackNavigator} 
        options={{ title: 'My Trips' }}
      />
      <Tab.Screen 
        name="ProfileStack" 
        component={ProfileStackNavigator} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Simple navigator for use with the simpler App version
export function SimpleAppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="AIPlanner" 
        component={AITripPlannerScreen} 
        options={{ 
          title: 'AI Trip Planner',
          headerShown: true 
        }}
      />
      <Stack.Screen 
        name="AITripPlannerScreen" 
        component={AITripPlannerScreen} 
        options={{ 
          title: 'AI Trip Planner',
          headerShown: true 
        }}
      />
      <Stack.Screen 
        name="TripSuggestionsScreen" 
        component={TripSuggestionsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AITripResultScreen" 
        component={AITripResultScreen} 
        options={{ 
          headerShown: false
        }}
      />
      <Stack.Screen
        name="SavedTrips"
        component={SavedTripsScreen}
        options={{
          title: 'My Trips',
          headerShown: true
        }}
      />
      <Stack.Screen name="Profile" component={MyProfileScreen} />
    </Stack.Navigator>
  );
}