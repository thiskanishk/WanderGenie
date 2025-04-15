import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set up HTTP link to GraphQL API
const httpLink = createHttpLink({
  uri: 'https://api.wandergenie.com/graphql', // Replace with your actual GraphQL API endpoint
});

// Add authorization headers to requests
const authLink = setContext(async (_operation: any, { headers = {} }) => {
  // Get the authentication token from AsyncStorage
  const token = await AsyncStorage.getItem('auth_token');
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo client
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
}); 