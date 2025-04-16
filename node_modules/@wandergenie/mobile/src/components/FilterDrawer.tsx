import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions
const { height } = Dimensions.get('window');

export interface FilterOptions {
  destinationType: string | null;
  status: 'all' | 'draft' | 'planned' | 'shared';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'alphabetical' | 'dateCreated' | 'budget';
  sortOrder: 'asc' | 'desc';
}

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  options: FilterOptions;
  onApplyFilters: (options: FilterOptions) => void;
  onResetFilters: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  visible,
  onClose,
  options,
  onApplyFilters,
  onResetFilters,
}) => {
  // Local state to track filter changes
  const [localOptions, setLocalOptions] = useState<FilterOptions>(options);
  const [animation] = useState(new Animated.Value(0));
  
  // Animate drawer on open/close
  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, animation]);
  
  // Handle destination type selection
  const handleDestinationType = (type: string) => {
    setLocalOptions({
      ...localOptions,
      destinationType: localOptions.destinationType === type ? null : type,
    });
  };
  
  // Handle status selection
  const handleStatus = (status: 'all' | 'draft' | 'planned' | 'shared') => {
    setLocalOptions({
      ...localOptions,
      status: status,
    });
  };
  
  // Handle sort by selection
  const handleSortBy = (sortBy: 'alphabetical' | 'dateCreated' | 'budget') => {
    setLocalOptions({
      ...localOptions,
      sortBy,
      // Toggle sort order if selecting the same sort criterion
      sortOrder: localOptions.sortBy === sortBy && localOptions.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };
  
  // Handle apply filters
  const handleApply = () => {
    onApplyFilters(localOptions);
    onClose();
  };
  
  // Handle reset filters
  const handleReset = () => {
    const resetOptions: FilterOptions = {
      destinationType: null,
      status: 'all',
      dateRange: {
        start: null,
        end: null,
      },
      sortBy: 'dateCreated',
      sortOrder: 'desc',
    };
    setLocalOptions(resetOptions);
    onResetFilters();
  };
  
  // Animation values
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View 
            style={[
              styles.drawer,
              { transform: [{ translateY }] }
            ]}
          >
            <TouchableWithoutFeedback>
              <View>
                <View style={styles.handle} />
                
                <Text style={styles.title}>Filter & Sort</Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Filter By</Text>
                  
                  <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Destination Type</Text>
                    <View style={styles.chipContainer}>
                      {['Beach', 'City', 'Mountain', 'Cultural', 'Adventure'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.chip,
                            localOptions.destinationType === type && styles.activeChip,
                          ]}
                          onPress={() => handleDestinationType(type)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              localOptions.destinationType === type && styles.activeChipText,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <View style={styles.chipContainer}>
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'draft', label: 'Draft' },
                        { id: 'planned', label: 'Planned' },
                        { id: 'shared', label: 'Shared' },
                      ].map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.chip,
                            localOptions.status === item.id && styles.activeChip,
                          ]}
                          onPress={() => handleStatus(item.id as any)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              localOptions.status === item.id && styles.activeChipText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sort By</Text>
                  
                  <View style={styles.sortOptions}>
                    {[
                      { id: 'alphabetical', label: 'A-Z' },
                      { id: 'dateCreated', label: 'Date Created' },
                      { id: 'budget', label: 'Budget' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.sortOption,
                          localOptions.sortBy === item.id && styles.activeSortOption,
                        ]}
                        onPress={() => handleSortBy(item.id as any)}
                      >
                        <Text
                          style={[
                            styles.sortOptionText,
                            localOptions.sortBy === item.id && styles.activeSortOptionText,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {localOptions.sortBy === item.id && (
                          <Ionicons
                            name={localOptions.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                            size={16}
                            color="#6200ee"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApply}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#6200ee',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  activeChipText: {
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
    paddingVertical: 8,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterDrawer; 