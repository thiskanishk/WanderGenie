import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch } from '../store';
import { fetchTrips, deleteTrip, Trip } from '../store/slices/tripsSlice';
import { useAppSelector } from '../hooks/reduxHooks';
import TripCard from '../components/TripCard';
import AppText from '../components/AppText';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define the tabs for filtering trips
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'planned', label: 'Planned' },
];

// Interface for the bottom sheet filter options
interface FilterOptions {
  destinationType: string | null;
  status: 'all' | 'draft' | 'planned' | 'shared';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'alphabetical' | 'dateCreated' | 'budget';
  sortOrder: 'asc' | 'desc';
}

// Create animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Trip>);

const SavedTripsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  // States
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    destinationType: null,
    status: 'all',
    dateRange: {
      start: null,
      end: null,
    },
    sortBy: 'dateCreated',
    sortOrder: 'desc',
  });
  
  // Animations
  const filterSheetAnim = useRef(new Animated.Value(0)).current;
  const fabRotationAnim = useRef(new Animated.Value(0)).current;
  const fabMenuAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Get trips from Redux store
  const { trips, isLoading } = useAppSelector((state) => state.trips);
  
  // Effect to fetch trips on mount
  useEffect(() => {
    loadTrips();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Check if a trip is upcoming based on its start date
  const isUpcoming = (startDate: string): boolean => {
    const today = new Date();
    const tripStartDate = new Date(startDate);
    return tripStartDate > today;
  };
  
  // Calculate days remaining for upcoming trips
  const getDaysRemaining = (startDate: string) => {
    const today = new Date();
    const tripStart = new Date(startDate);
    const diffTime = tripStart.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Load trips
  const loadTrips = async () => {
    setRefreshing(true);
    await dispatch(fetchTrips());
    setRefreshing(false);
  };
  
  // Filter trips based on active tab
  const getFilteredTrips = () => {
    let filtered = [...trips];
    
    // Apply tab filter
    if (activeTab === 'drafts') {
      filtered = filtered.filter((trip) => trip.isDraft);
    } else if (activeTab === 'planned') {
      filtered = filtered.filter((trip) => !trip.isDraft);
    }
    
    // Apply detailed filters if any
    if (filterOptions.destinationType) {
      // In a real app, you would filter by destination type
      // For now, we'll just filter by destination containing the type string
      filtered = filtered.filter((trip) => 
        trip.destination.toLowerCase().includes(filterOptions.destinationType!.toLowerCase())
      );
    }
    
    if (filterOptions.status !== 'all') {
      if (filterOptions.status === 'draft') {
        filtered = filtered.filter((trip) => trip.isDraft);
      } else if (filterOptions.status === 'planned') {
        filtered = filtered.filter((trip) => !trip.isDraft);
      }
      // 'shared' status would require additional trip property
    }
    
    if (filterOptions.dateRange.start && filterOptions.dateRange.end) {
      filtered = filtered.filter((trip) => {
        const tripDate = new Date(trip.createdAt);
        return tripDate >= filterOptions.dateRange.start! && 
               tripDate <= filterOptions.dateRange.end!;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const multiplier = filterOptions.sortOrder === 'asc' ? 1 : -1;
      
      if (filterOptions.sortBy === 'alphabetical') {
        return multiplier * a.title.localeCompare(b.title);
      } else if (filterOptions.sortBy === 'dateCreated') {
        return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (filterOptions.sortBy === 'budget') {
        const aBudget = a.budget?.amount || 0;
        const bBudget = b.budget?.amount || 0;
        return multiplier * (aBudget - bBudget);
      }
      
      return 0;
    });
    
    return filtered;
  };
  
  // Group trips by status
  const groupTripsByStatus = () => {
    const filteredTrips = getFilteredTrips();
    const drafts = filteredTrips.filter((trip) => trip.isDraft);
    const planned = filteredTrips.filter((trip) => !trip.isDraft);
    
    // Sort planned trips by start date
    planned.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return { drafts, planned };
  };
  
  // Navigate to trip detail
  const navigateToTripDetail = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };
  
  // Delete trip
  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTrip(tripId));
          }
        },
      ]
    );
  };
  
  // Edit trip
  const handleEditTrip = (tripId: string) => {
    // Navigate to edit screen
    navigation.navigate('EditTrip', { tripId });
  };
  
  // Share trip
  const handleShareTrip = (tripId: string) => {
    navigation.navigate('ShareTrip', { tripId });
  };
  
  // Toggle FAB menu
  const toggleFabMenu = () => {
    const newValue = !isFabExpanded;
    setIsFabExpanded(newValue);
    
    Animated.parallel([
      Animated.timing(fabRotationAnim, {
        toValue: newValue ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fabMenuAnim, {
        toValue: newValue ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Show context menu for a trip
  const showTripContextMenu = (tripId: string) => {
    setSelectedTripId(tripId);
    setShowContextMenu(true);
  };
  
  // Animation values for filter sheet
  const filterSheetHeight = filterSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350], // Height of the filter sheet
  });
  
  // Animation values for FAB
  const fabRotation = fabRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  
  // Animation values for FAB visibility based on scroll
  const fabTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });
  
  // Toggle filter sheet
  const toggleFilterSheet = () => {
    const newValue = !isFilterVisible;
    setIsFilterVisible(newValue);
    
    Animated.timing(filterSheetAnim, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      destinationType: null,
      status: 'all',
      dateRange: {
        start: null,
        end: null,
      },
      sortBy: 'dateCreated',
      sortOrder: 'desc',
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    toggleFilterSheet();
  };
  
  // Render trip card
  const renderTripCard = ({ item }: { item: Trip }) => {
    const tripStatus = item.isDraft ? 'draft' : 'planned';
    
    return (
      <View style={styles.tripCardContainer}>
        <TouchableOpacity 
          style={styles.tripCard}
          onPress={() => navigateToTripDetail(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080' }} 
              style={styles.tripImage}
            />
            <View style={[
              styles.statusBadge, 
              tripStatus === 'draft' ? styles.draftBadge : styles.plannedBadge
            ]}>
              <AppText style={styles.statusText}>
                {tripStatus === 'draft' ? 'Draft' : 'Planned'}
              </AppText>
            </View>
          </View>
          
          <View style={styles.tripContent}>
            <AppText style={styles.tripTitle}>{item.title}</AppText>
            <AppText style={styles.destination}>{item.destination}</AppText>
            
            <View style={styles.metadata}>
              <View style={styles.metadataItem}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <AppText style={styles.metadataText}>
                  {formatDate(item.startDate)}
                  {item.endDate && ` - ${formatDate(item.endDate)}`}
                </AppText>
              </View>
              
              <View style={styles.metadataItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <AppText style={styles.metadataText}>
                  {item.days.length} {item.days.length === 1 ? 'day' : 'days'}
                </AppText>
              </View>
              
              <View style={styles.metadataItem}>
                <Ionicons name="cash-outline" size={14} color="#666" />
                <AppText style={styles.metadataText}>
                  {item.budget ? `${item.budget.currency} ${item.budget.amount}` : 'Not specified'}
                </AppText>
              </View>
            </View>
            
            {!item.isDraft && isUpcoming(item.startDate) && (
              <View style={styles.upcomingBadge}>
                <AppText style={styles.upcomingText}>
                  {getDaysRemaining(item.startDate)} to go
                </AppText>
              </View>
            )}
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditTrip(item.id)}
            >
              <Ionicons name="create-outline" size={20} color="#6200ee" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShareTrip(item.id)}
            >
              <Ionicons name="share-social-outline" size={20} color="#6200ee" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteTrip(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render separator between trips
  const renderSeparator = () => <View style={styles.separator} />;
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="planet-outline" size={80} color="#ddd" />
      <AppText style={styles.emptyStateTitle}>No saved trips yet</AppText>
      <AppText style={styles.emptyStateText}>
        You haven't saved any trips yet. Start your first one now!
      </AppText>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('AITripPlannerScreen')}
      >
        <AppText style={styles.emptyStateButtonText}>Plan New Trip</AppText>
      </TouchableOpacity>
    </View>
  );
  
  // Render group header
  const renderGroupHeader = (title: string) => (
    <View style={styles.groupHeader}>
      <AppText style={styles.groupTitle}>{title}</AppText>
    </View>
  );
  
  // Render filter sheet
  const renderFilterSheet = () => (
    <Animated.View 
      style={[
        styles.filterSheet,
        { height: filterSheetHeight }
      ]}
    >
      <View style={styles.filterSheetHandle} />
      
      <AppText style={styles.filterTitle}>Filter & Sort</AppText>
      
      <View style={styles.filterSection}>
        <AppText style={styles.filterSectionTitle}>Filter By</AppText>
        
        <View style={styles.filterRow}>
          <AppText style={styles.filterLabel}>Destination Type</AppText>
          {/* Destination type filter UI - simplified for this example */}
          <View style={styles.filterChips}>
            <TouchableOpacity 
              style={[
                styles.filterChip,
                filterOptions.destinationType === 'Beach' && styles.activeFilterChip
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                destinationType: filterOptions.destinationType === 'Beach' ? null : 'Beach'
              })}
            >
              <AppText style={[
                styles.filterChipText,
                filterOptions.destinationType === 'Beach' && styles.activeFilterChipText
              ]}>Beach</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterChip,
                filterOptions.destinationType === 'City' && styles.activeFilterChip
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                destinationType: filterOptions.destinationType === 'City' ? null : 'City'
              })}
            >
              <AppText style={[
                styles.filterChipText,
                filterOptions.destinationType === 'City' && styles.activeFilterChipText
              ]}>City</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterChip,
                filterOptions.destinationType === 'Mountain' && styles.activeFilterChip
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                destinationType: filterOptions.destinationType === 'Mountain' ? null : 'Mountain'
              })}
            >
              <AppText style={[
                styles.filterChipText,
                filterOptions.destinationType === 'Mountain' && styles.activeFilterChipText
              ]}>Mountain</AppText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <AppText style={styles.filterLabel}>Status</AppText>
          <View style={styles.filterChips}>
            <TouchableOpacity 
              style={[
                styles.filterChip,
                filterOptions.status === 'draft' && styles.activeFilterChip
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                status: filterOptions.status === 'draft' ? 'all' : 'draft'
              })}
            >
              <AppText style={[
                styles.filterChipText,
                filterOptions.status === 'draft' && styles.activeFilterChipText
              ]}>Draft</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterChip,
                filterOptions.status === 'planned' && styles.activeFilterChip
              ]}
              onPress={() => setFilterOptions({
                ...filterOptions,
                status: filterOptions.status === 'planned' ? 'all' : 'planned'
              })}
            >
              <AppText style={[
                styles.filterChipText,
                filterOptions.status === 'planned' && styles.activeFilterChipText
              ]}>Planned</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <AppText style={styles.filterSectionTitle}>Sort By</AppText>
        
        <View style={styles.sortOptions}>
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => setFilterOptions({
              ...filterOptions,
              sortBy: 'alphabetical',
              sortOrder: filterOptions.sortBy === 'alphabetical' && filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
            })}
          >
            <AppText style={[
              styles.sortOptionText,
              filterOptions.sortBy === 'alphabetical' && styles.activeSortOptionText
            ]}>A-Z</AppText>
            {filterOptions.sortBy === 'alphabetical' && (
              <Ionicons 
                name={filterOptions.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={14} 
                color="#6200ee" 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => setFilterOptions({
              ...filterOptions,
              sortBy: 'dateCreated',
              sortOrder: filterOptions.sortBy === 'dateCreated' && filterOptions.sortOrder === 'desc' ? 'asc' : 'desc'
            })}
          >
            <AppText style={[
              styles.sortOptionText,
              filterOptions.sortBy === 'dateCreated' && styles.activeSortOptionText
            ]}>Date Created</AppText>
            {filterOptions.sortBy === 'dateCreated' && (
              <Ionicons 
                name={filterOptions.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={14} 
                color="#6200ee" 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => setFilterOptions({
              ...filterOptions,
              sortBy: 'budget',
              sortOrder: filterOptions.sortBy === 'budget' && filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
            })}
          >
            <AppText style={[
              styles.sortOptionText,
              filterOptions.sortBy === 'budget' && styles.activeSortOptionText
            ]}>Budget</AppText>
            {filterOptions.sortBy === 'budget' && (
              <Ionicons 
                name={filterOptions.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={14} 
                color="#6200ee" 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.filterActions}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetFilters}
        >
          <AppText style={styles.resetButtonText}>Reset</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={applyFilters}
        >
          <AppText style={styles.applyButtonText}>Apply</AppText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
  
  // Render FAB menu
  const renderFabMenu = () => {
    const fabMenuItems = [
      {
        icon: 'add',
        label: 'Plan New Trip',
        onPress: () => navigation.navigate('AITripPlannerScreen'),
      },
      {
        icon: 'download',
        label: 'Import PDF Trip',
        onPress: () => console.log('Import PDF Trip'),
      },
      {
        icon: 'sync',
        label: 'Calendar Sync',
        onPress: () => console.log('Calendar Sync'),
      },
    ];
    
    return (
      <Animated.View 
        style={[
          styles.fabContainer,
          { transform: [{ translateY: fabTranslateY }] }
        ]}
      >
        {isFabExpanded && (
          <View style={styles.fabMenuContainer}>
            {fabMenuItems.map((item, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.fabMenuItem,
                  {
                    opacity: fabMenuAnim,
                    transform: [
                      { 
                        translateY: fabMenuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, -10 - (index * 60)],
                        })
                      }
                    ]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.fabMenuItemButton}
                  onPress={item.onPress}
                >
                  <Ionicons name={item.icon as any} size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.fabMenuItemLabel}>
                  <AppText style={styles.fabMenuItemText}>{item.label}</AppText>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.fab}
          onPress={toggleFabMenu}
        >
          <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
            <Ionicons name="add" size={30} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const { drafts, planned } = groupTripsByStatus();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>My Trips</AppText>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleFilterSheet}
        >
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <AppText style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Trip list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <AppText style={styles.loadingText}>Loading your trips...</AppText>
        </View>
      ) : (
        getFilteredTrips().length === 0 ? (
          renderEmptyState()
        ) : (
          <AnimatedFlatList
            data={getFilteredTrips()}
            renderItem={renderTripCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={renderSeparator}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadTrips}
                colors={['#6200ee']}
              />
            }
            ListHeaderComponent={activeTab === 'all' ? (
              <>
                {drafts.length > 0 && renderGroupHeader('Draft Trips')}
                {drafts.map((trip) => renderTripCard({ item: trip }))}
                {planned.length > 0 && renderGroupHeader('Planned / Upcoming Trips')}
              </>
            ) : null}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          />
        )
      )}
      
      {/* Filter Sheet */}
      {renderFilterSheet()}
      
      {/* FAB */}
      {renderFabMenu()}
      
      {/* Context Menu Modal - to be implemented */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tab: {
    marginRight: 20,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for FAB
  },
  tripCardContainer: {
    marginVertical: 10,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  tripImage: {
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
  tripContent: {
    padding: 15,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  destination: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  upcomingBadge: {
    marginTop: 10,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  upcomingText: {
    fontSize: 12,
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
  separator: {
    height: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  groupHeader: {
    paddingVertical: 12,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    padding: 20,
    overflow: 'hidden',
  },
  filterSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#6200ee',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeSortOption: {
    backgroundColor: '#e3f2fd',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  activeSortOptionText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  resetButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 70,
    right: 5,
    alignItems: 'flex-end',
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fabMenuItemButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenuItemLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 10,
  },
  fabMenuItemText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default SavedTripsScreen;