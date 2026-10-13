import Mapbox from '@rnmapbox/maps';
import DrawMap from './src/components/DrawMap';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

export default function App() {
  return <DrawMap />;
}