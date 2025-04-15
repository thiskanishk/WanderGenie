import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define types
export interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  websiteUrl?: string;
  contactInfo?: string;
  openingHours?: string;
  category: string;
  tags: string[];
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: Location;
  cost?: number;
  currency?: string;
  notes?: string;
  isBooked: boolean;
}

export interface DailyPlan {
  date: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  budget?: {
    amount: number;
    currency: string;
    spent?: number;
  };
  days: DailyPlan[];
  participants?: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
  }[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
  isDraft: boolean;
  isAiGenerated: boolean;
}

interface TripFilters {
  searchQuery?: string;
  upcoming?: boolean;
  past?: boolean;
  drafts?: boolean;
}

interface TripsState {
  trips: Trip[];
  selectedTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  pendingChanges: {
    [tripId: string]: {
      isUpdating: boolean;
      isDeleting: boolean;
      lastError?: string;
    };
  };
  filters: TripFilters;
}

// Initial state
const initialState: TripsState = {
  trips: [],
  selectedTrip: null,
  isLoading: false,
  error: null,
  pendingChanges: {},
  filters: {
    upcoming: true,
    past: false,
    drafts: false,
  },
};

// Mock trips for development
const mockTrips: Trip[] = [
  {
    id: '1',
    title: 'Beach Vacation in Bali',
    description: 'Relaxing beach vacation with surfing and exploring temples',
    destination: 'Bali, Indonesia',
    startDate: '2023-08-01',
    endDate: '2023-08-10',
    imageUrl: 'https://example.com/bali.jpg',
    budget: {
      amount: 2000,
      currency: 'USD',
      spent: 500,
    },
    days: [
      {
        date: '2023-08-01',
        activities: [
          {
            id: 'a1',
            title: 'Arrival and Check-in',
            description: 'Arrive at Denpasar Airport and check into resort',
            type: 'transport',
            startTime: '2023-08-01T10:00:00',
            endTime: '2023-08-01T14:00:00',
            isBooked: true,
          },
        ],
      },
    ],
    createdAt: '2023-06-15T12:00:00',
    updatedAt: '2023-06-15T12:00:00',
    lastSyncedAt: '2023-06-15T12:00:00',
    isDraft: false,
    isAiGenerated: true,
  },
];

// Async thunks
export const fetchTrips = createAsyncThunk('trips/fetchTrips', async (_, { rejectWithValue }) => {
  try {
    // In a real app, this would be an API call
    // const response = await api.get('/trips');
    // return response.data;

    // For now, return mock data
    return mockTrips;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (tripId: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get(`/trips/${tripId}`);
      // return response.data;

      // For now, return mock data
      const trip = mockTrips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }
      return trip;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData: Partial<Trip>, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/trips', tripData);
      // return response.data;

      // For now, create mock data
      const newTrip: Trip = {
        id: `new-${Date.now()}`,
        title: tripData.title || 'New Trip',
        destination: tripData.destination || 'Unknown',
        startDate: tripData.startDate || new Date().toISOString(),
        endDate: tripData.endDate || new Date().toISOString(),
        days: tripData.days || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDraft: true,
        isAiGenerated: tripData.isAiGenerated || false,
      };
      return newTrip;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ tripId, tripData }: { tripId: string; tripData: Partial<Trip> }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/trips/${tripId}`, tripData);
      // return response.data;

      // For now, update mock data
      return {
        id: tripId,
        ...tripData,
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/trips/${tripId}`);
      // return tripId;

      // For now, just return the ID
      return tripId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Trip slice
const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setSelectedTrip: (state, action: PayloadAction<Trip | null>) => {
      state.selectedTrip = action.payload;
    },
    setFilters: (state, action: PayloadAction<TripFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch trips
    builder.addCase(fetchTrips.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTrips.fulfilled, (state, action: PayloadAction<Trip[]>) => {
      state.isLoading = false;
      state.trips = action.payload;
    });
    builder.addCase(fetchTrips.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch trip by ID
    builder.addCase(fetchTripById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTripById.fulfilled, (state, action: PayloadAction<Trip>) => {
      state.isLoading = false;
      state.selectedTrip = action.payload;
      // Also update the trip in trips array if it exists
      const index = state.trips.findIndex((trip) => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      } else {
        state.trips.push(action.payload);
      }
    });
    builder.addCase(fetchTripById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create trip
    builder.addCase(createTrip.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
      state.isLoading = false;
      state.trips.push(action.payload);
      state.selectedTrip = action.payload;
    });
    builder.addCase(createTrip.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update trip
    builder.addCase(updateTrip.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      const tripId = action.meta.arg.tripId;
      state.pendingChanges[tripId] = { ...state.pendingChanges[tripId], isUpdating: true };
    });
    builder.addCase(updateTrip.fulfilled, (state, action: PayloadAction<Partial<Trip>>) => {
      state.isLoading = false;
      const tripId = action.payload.id as string;
      
      // Update in trips array
      const tripIndex = state.trips.findIndex((trip) => trip.id === tripId);
      if (tripIndex !== -1) {
        state.trips[tripIndex] = { ...state.trips[tripIndex], ...action.payload };
      }
      
      // Update selected trip if it's the same one
      if (state.selectedTrip && state.selectedTrip.id === tripId) {
        state.selectedTrip = { ...state.selectedTrip, ...action.payload };
      }
      
      // Clear pending changes
      if (state.pendingChanges[tripId]) {
        state.pendingChanges[tripId].isUpdating = false;
      }
    });
    builder.addCase(updateTrip.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      const tripId = action.meta.arg.tripId;
      if (state.pendingChanges[tripId]) {
        state.pendingChanges[tripId].isUpdating = false;
        state.pendingChanges[tripId].lastError = action.payload as string;
      }
    });

    // Delete trip
    builder.addCase(deleteTrip.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      const tripId = action.meta.arg;
      state.pendingChanges[tripId] = { ...state.pendingChanges[tripId], isDeleting: true };
    });
    builder.addCase(deleteTrip.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      const tripId = action.payload;
      
      // Remove from trips array
      state.trips = state.trips.filter((trip) => trip.id !== tripId);
      
      // Clear selected trip if it's the same one
      if (state.selectedTrip && state.selectedTrip.id === tripId) {
        state.selectedTrip = null;
      }
      
      // Remove from pending changes
      delete state.pendingChanges[tripId];
    });
    builder.addCase(deleteTrip.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      const tripId = action.meta.arg;
      if (state.pendingChanges[tripId]) {
        state.pendingChanges[tripId].isDeleting = false;
        state.pendingChanges[tripId].lastError = action.payload as string;
      }
    });
  },
});

export const { setSelectedTrip, setFilters, resetError } = tripsSlice.actions;
export default tripsSlice.reducer; 