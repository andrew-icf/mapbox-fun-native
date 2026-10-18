import Mapbox from '@rnmapbox/maps';
import { ApolloProvider } from '@apollo/client/react';
import { NavigationContainer } from '@react-navigation/native';
import { client } from './src/apollo';
import AppTabs from './src/app/AppTabs';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </ApolloProvider>
  );
}