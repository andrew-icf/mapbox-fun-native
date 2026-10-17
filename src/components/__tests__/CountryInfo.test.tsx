import { fireEvent, render, screen } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import CountryInfo, { COUNTRIES } from '../CountryInfo';
import { GET_COUNTRY } from '../../graphql/queries';

const mocks = [
  {
    request: { query: GET_COUNTRY, variables: { code: 'US' } },
    result: {
      data: {
        country: { __typename: 'Country', name: 'United States', capital: 'Washington D.C.', currency: 'USD' },
      },
    },
  },
  {
    request: { query: GET_COUNTRY, variables: { code: 'CA' } },
    result: {
      data: {
        country: { __typename: 'Country', name: 'Canada', capital: 'Ottawa', currency: 'CAD' },
      },
    },
  },
];

describe('CountryInfo', () => {
  it('shows loading, then the default country', async () => {
    await render(
      <MockedProvider mocks={mocks}>
        <CountryInfo />
      </MockedProvider>
    );
    expect(screen.getByText('Loading...')).toBeOnTheScreen();
    expect(await screen.findByText(/United States: Washington D.C./)).toBeOnTheScreen();
  });

  it('loads the selected country and notifies the parent', async () => {
    const onSelectCountry = jest.fn();
    await render(
      <MockedProvider mocks={mocks}>
        <CountryInfo onSelectCountry={onSelectCountry} />
      </MockedProvider>
    );
    await screen.findByText(/United States/);

    await fireEvent.press(screen.getByText('CA'));

    expect(onSelectCountry).toHaveBeenCalledWith(COUNTRIES.find((c) => c.code === 'CA'));
    expect(await screen.findByText(/Canada: Ottawa/)).toBeOnTheScreen();
  });

  it('shows an error message when the request fails', async () => {
    const errorMocks = [
      { request: { query: GET_COUNTRY, variables: { code: 'US' } }, error: new Error('Network down') },
    ];
    await render(
      <MockedProvider mocks={errorMocks}>
        <CountryInfo />
      </MockedProvider>
    );
    expect(await screen.findByText(/Error: Network down/)).toBeOnTheScreen();
  });
});