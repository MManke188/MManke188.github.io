import { createMemo } from 'solid-js';
import { createStore, SetStoreFunction } from 'solid-js/store';
import { List } from '../ShoppingBoard/components/List';

export function createLocalStore(
  initState: List[]
): [{ lists: List[] }, SetStoreFunction<{ lists: List[] }>] {
  const [state, setState] = createStore({ lists: initState });

  if (localStorage.lists) setState('lists', JSON.parse(localStorage.lists));

  createMemo(
    () => (localStorage.lists = JSON.stringify(state.lists)),
    [state, state.lists]
  );

  return [state, setState];
}

export function createItemOrder(
  initState: string[]
): [string[], SetStoreFunction<string[]>] {
  const [state, setState] = createStore(initState);

  if (localStorage.itemOrder) setState(JSON.parse(localStorage.itemOrder));

  createMemo(() => (localStorage.itemOrder = JSON.stringify(state)));
  console.log(state);

  return [state, setState];
}
