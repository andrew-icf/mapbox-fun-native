import { fireEvent, render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from '../AppTabs';

// Replace the real screens with simple stand-ins, so this test checks navigation only, not Mapbox or GraphQL.
// DrawMap Standin Element
jest.mock('../../components/DrawMap', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: () => React.createElement(Text, null, 'Map screen') };
});

// LoadBoard Standin Element  
jest.mock('../../features/loads/LoadBoardScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: () => React.createElement(Text, null, 'Load board screen') };
});

function renderTabs() {
  return render(
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
}

describe('AppTabs', () => {
  it('shows the load board by default', async () => {
    await renderTabs();
    expect(screen.getByText('Load board screen')).toBeOnTheScreen();
  });

  it('switches to the map when the map tab is pressed', async () => {
    await renderTabs();
    await fireEvent.press(screen.getByTestId('tab-map'));
    expect(await screen.findByText('Map screen')).toBeOnTheScreen();
  });
});