import { render, screen } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import LoadBoardScreen from '../LoadBoardScreen';
import { GET_RECOMMENDED_LOADS } from '../queries';
import { makeLoad, withTypenames } from '../../../test/loadFactory';

describe('LoadBoardScreen', () => {
  it('shows a card for each load', async () => {
    const loads = [
      makeLoad({ id: '1', carrier: 'Alpha Freight' }),
      makeLoad({ id: '2', carrier: 'Bravo Hauling' }),
    ];
    await render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_RECOMMENDED_LOADS },
            result: { data: { recommendedLoads: loads.map(withTypenames) } },
          },
        ]}
      >
        <LoadBoardScreen />
      </MockedProvider>
    );
    expect(await screen.findByText('Alpha Freight')).toBeOnTheScreen();
    expect(screen.getByText('Bravo Hauling')).toBeOnTheScreen();
  });

  it('shows an empty message when there are no loads', async () => {
    await render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_RECOMMENDED_LOADS },
            result: { data: { recommendedLoads: [] } },
          },
        ]}
      >
        <LoadBoardScreen />
      </MockedProvider>
    );
    expect(await screen.findByText('No loads found')).toBeOnTheScreen();
  });

  it('shows an error message when the query fails', async () => {
    await render(
      <MockedProvider
        mocks={[{ request: { query: GET_RECOMMENDED_LOADS }, error: new Error('Server unavailable') }]}
      >
        <LoadBoardScreen />
      </MockedProvider>
    );
    expect(await screen.findByText(/Server unavailable/)).toBeOnTheScreen();
  });
});