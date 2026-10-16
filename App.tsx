import Mapbox from '@rnmapbox/maps';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './src/apollo';
import DrawMap from './src/components/DrawMap';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function App() {
  return (
    <ApolloProvider client={client}>
      <DrawMap />
    </ApolloProvider>
  );
}