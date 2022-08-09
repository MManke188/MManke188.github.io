import type { Component } from 'solid-js';
import { For } from 'solid-js';
import styles from './App.module.css';
import { addList, removeList, store } from './helper/listFunctions';
import { List } from './ShoppingBoard/components/List';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>This is going to be an awesome shopping list</p>
      </header>
      <button onClick={addList}>Create List</button>
      <button onClick={removeList}>Remove List</button>
      <div id={styles.listContainer}>
        <For each={store.lists}>{(_, i) => <List index={i()} />}</For>
      </div>
    </div>
  );
};

export default App;
