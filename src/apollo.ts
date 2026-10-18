import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { localSchema } from './graphql/localSchema';

// Using a free public GQL API ( Countries ) to practice
const countriesLink = new HttpLink({ uri: 'https://countries.trevorblades.com/' });

// Local schema with dummy data for loads, running inside the app
const localLink = new SchemaLink({ schema: localSchema });

// Send GetCountry to the public API, everything else to the local schema
export const client = new ApolloClient({
  link: ApolloLink.split(
    (operation) => operation.operationName === 'GetCountry',
    countriesLink,
    localLink
  ),
  cache: new InMemoryCache(),
});