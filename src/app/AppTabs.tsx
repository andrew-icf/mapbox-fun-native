import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DrawMap from '../components/DrawMap';
import LoadBoardScreen from '../features/loads/LoadBoardScreen';
import { colors } from '../shared/theme';

export type TabParamList = { LoadBoard: undefined; Map: undefined };

const Tab = createBottomTabNavigator<TabParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={route.name === 'LoadBoard' ? 'list' : 'navigate-outline'} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen
        name="LoadBoard"
        component={LoadBoardScreen}
        options={{ title: 'Load Board', tabBarButtonTestID: 'tab-load-board' }}
      />
      <Tab.Screen name="Map" component={DrawMap} options={{ tabBarButtonTestID: 'tab-map' }} />
    </Tab.Navigator>
  );
}