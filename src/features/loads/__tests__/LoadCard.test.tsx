import { render, screen } from '@testing-library/react-native';
import LoadCard from '../LoadCard';
import { makeLoad } from '../../../test/loadFactory';

describe('LoadCard', () => {
  it('shows the carrier, route, and formatted rate', async () => {
    await render(<LoadCard load={makeLoad()} />);
    expect(screen.getByText('Test Carrier')).toBeOnTheScreen();
    expect(screen.getByText(/Chicago, IL/)).toBeOnTheScreen();
    expect(screen.getByText('Denver, CO')).toBeOnTheScreen();
    expect(screen.getByText('$2,000')).toBeOnTheScreen();
    expect(screen.getByText('est $2.00/mi')).toBeOnTheScreen();
  });

  it('shows the badge when the load has one', async () => {
    await render(<LoadCard load={makeLoad({ badge: 'HIGH_OUTBOUND' })} />);
    expect(screen.getByText('HIGH OUTBOUND')).toBeOnTheScreen();
  });

  it('hides the badge when the load has none', async () => {
    await render(<LoadCard load={makeLoad({ badge: null })} />);
    expect(screen.queryByText('HIGH OUTBOUND')).not.toBeOnTheScreen();
    expect(screen.queryByText('HIGH RATE')).not.toBeOnTheScreen();
  });

  it('labels partial loads', async () => {
    await render(<LoadCard load={makeLoad({ fullLoad: false })} />);
    expect(screen.getByText('PARTIAL')).toBeOnTheScreen();
  });
});