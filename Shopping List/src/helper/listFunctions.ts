import { createItemOrder, createLocalStore } from '../store/localStore';

export const [store, setStore] = createLocalStore([]);

export const addList = () => {
  setStore('lists', (lists) => [...lists, { title: '', items: [] }]);
};
export const removeList = () => {
  setStore('lists', (lists) => [...lists.slice(0, lists.length - 1)]);
};

export const [itemOrder, setItemOrder] = createItemOrder([]);
