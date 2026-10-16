import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// Using a free public GQL API ( Countries ) to practice
export const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://countries.trevorblades.com/' }),
  cache: new InMemoryCache(),
});