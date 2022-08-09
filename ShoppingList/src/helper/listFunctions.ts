import { createItemOrder, createLocalStore } from '../store/localStore';

export const [store, setStore] = createLocalStore([
  { title: 'Recipies', items: [{ title: '' }] },
  { title: 'Shopping List', items: [] },
]);

export const [itemOrder, setItemOrder] = createItemOrder([]);
