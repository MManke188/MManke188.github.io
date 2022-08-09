import type { Component } from 'solid-js';
import { For } from 'solid-js';
import styles from './App.module.css';
import { store } from './helper/listFunctions';
import { List } from './ShoppingBoard/components/List';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>Your new favorite Shopping App</p>
        <p class={styles.headerText}>
          It will automatically sort and add the items to the list. It will also
          remember the order of the items!
        </p>
      </header>
      <div id={styles.listContainer}>
        <For each={store.lists}>{(_, i) => <List index={i()} />}</For>
      </div>
    </div>
  );
};

export default App;
