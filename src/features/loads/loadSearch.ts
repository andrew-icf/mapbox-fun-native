import { useCallback, useEffect, useState } from 'react';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';

// Search state for the load board.
// text updates on every keystroke so the input feels instant.
// searchQuery is trimmed and debounced with RxJS, so it only updates once typing
// pauses for delayMs keeping the GraphQL searchQuery from running on every letter.
export function useLoadSearch(delayMs = 300) {
  const [searchText, setSearchTextState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Lazy useState keeps one Subject for the component's lifetime
  const [input$] = useState(() => new Subject<string>());

  useEffect(() => {
    const subscription = input$
      .pipe(
        map((value) => value.trim()),
        debounceTime(delayMs),
        distinctUntilChanged()
      )
      .subscribe(setSearchQuery);

    // Unsubscribe when the component unmounts, like ngOnDestroy
    return () => subscription.unsubscribe();
  }, [input$, delayMs]);

  const setSearchText = useCallback(
    (value: string) => {
      setSearchTextState(value);
      input$.next(value);
    },
    [input$]
  );

  return { searchText, setSearchText, searchQuery };
}