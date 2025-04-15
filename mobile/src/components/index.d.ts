import { Trip } from '../store/slices/tripsSlice';

declare module '../components/TripCard' {
  interface TripCardProps {
    trip: Trip;
    onPress: () => void;
    style?: any;
  }
  
  const TripCard: React.FC<TripCardProps>;
  export default TripCard;
}

declare module '../components/SearchBar' {
  interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    initialValue?: string;
  }
  
  const SearchBar: React.FC<SearchBarProps>;
  export default SearchBar;
}

declare module '../components/BigActionButton' {
  interface BigActionButtonProps {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    gradient?: string[];
  }
  
  const BigActionButton: React.FC<BigActionButtonProps>;
  export default BigActionButton;
}

declare module '../components/OfflineBanner' {
  const OfflineBanner: React.FC;
  export default OfflineBanner;
}

declare module '../components/LoadingScreen' {
  const LoadingScreen: React.FC;
  export default LoadingScreen;
} 