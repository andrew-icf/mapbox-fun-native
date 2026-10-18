import { act, renderHook } from '@testing-library/react-native';
import { useLoadSearch } from '../loadSearch';

describe('useLoadSearch', () => {
  // Fake timers let the test control time instead of actually waiting 300ms
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('updates searchText immediately but searchQuery only after the debounce', async () => {
    const { result } = await renderHook(() => useLoadSearch(300));

    await act(async () => {
      result.current.setSearchText('Chicago');
    });
    expect(result.current.searchText).toBe('Chicago');
    expect(result.current.searchQuery).toBe('');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.searchQuery).toBe('Chicago');
  });

  it('only uses the last value when typing quickly', async () => {
    const { result } = await renderHook(() => useLoadSearch(300));

    await act(async () => {
      result.current.setSearchText('M');
      jest.advanceTimersByTime(100);
      result.current.setSearchText('Ma');
      jest.advanceTimersByTime(100);
      result.current.setSearchText('Mad');
    });
    expect(result.current.searchQuery).toBe(''); // still typing, nothing emitted yet

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.searchQuery).toBe('Mad');
  });

  it('trims whitespace from the search query', async () => {
    const { result } = await renderHook(() => useLoadSearch(300));

    await act(async () => {
      result.current.setSearchText('  Madison  ');
      jest.advanceTimersByTime(300);
    });
    expect(result.current.searchQuery).toBe('Madison');
  });
});