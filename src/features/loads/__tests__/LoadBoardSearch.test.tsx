import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { SchemaLink } from '@apollo/client/link/schema';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoadBoardScreen from '../LoadBoardScreen';
import { localSchema } from '../../../graphql/localSchema';

// A fresh client per test, so cached results from one test can't leak into another
function renderWithLocalSchema() {
  const client = new ApolloClient({
    link: new SchemaLink({ schema: localSchema }),
    cache: new InMemoryCache(),
  });
  return render(
    <ApolloProvider client={client}>
      <LoadBoardScreen />
    </ApolloProvider>
  );
}

describe('LoadBoardScreen search', () => {
  it('filters loads by origin city after typing pauses', async () => {
    await renderWithLocalSchema();
    expect(await screen.findByText('Summit Haulers')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('origin-search'), 'chicago');

    expect(await screen.findByText('Search Origin: chicago')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Summit Haulers')).not.toBeOnTheScreen());
    expect(screen.getByText('Prairie Line Freight')).toBeOnTheScreen();
    expect(screen.getByText('Redline Logistics')).toBeOnTheScreen();
  });

  it('shows a helpful empty state when nothing matches', async () => {
    await renderWithLocalSchema();
    await screen.findByText('Summit Haulers');

    await fireEvent.changeText(screen.getByTestId('origin-search'), 'zzz');

    expect(await screen.findByText('No loads from "zzz"')).toBeOnTheScreen();
  });
});