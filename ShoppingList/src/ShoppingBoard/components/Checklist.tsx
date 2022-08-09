import { Component, createSignal, For } from 'solid-js';
import styles from '../../App.module.css';
import editIcon from '../../assets/editIcon.svg';
import trashCan from '../../assets/trashCan.png';
import { store } from '../../helper/listFunctions';

export const Checklist: Component<ChecklistProps> = ({
  listIndex,
  addItem,
  itemIndex,
  toggleItem,
  deleteChecklistItem,
}) => {
  return (
    <ul class={styles.checkList}>
      <For each={store.lists[listIndex].items[itemIndex].checkList}>
        {(item, i) => {
          const [shouldEdit, setShouldEdit] = createSignal(false);
          let inputRef: HTMLInputElement | undefined;
          return (
            <li
              onclick={() => item.title && !shouldEdit() && toggleItem(i())}
              style={{
                'text-decoration': item.checked ? 'line-through' : 'none',
                'user-select': 'none',
              }}
            >
              {item.title && !shouldEdit() ? (
                <div class={styles.checkListItem}>
                  {item.title}
                  <img
                    src={editIcon}
                    class={styles.editIcon}
                    onclick={() => {
                      setShouldEdit(true);
                    }}
                  />
                </div>
              ) : (
                <form
                  onsubmit={() => {
                    addItem(
                      itemIndex,
                      i(),
                      inputRef?.value || 'A sad item without a title'
                    );
                  }}
                  style={{
                    display: 'flex',
                    'flex-direction': 'row',
                    'align-items': 'center',
                    'justify-content': 'space-between',
                  }}
                >
                  <input
                    ref={inputRef}
                    placeholder={'...your ingredient'}
                    value={item.title}
                  >
                    {item.title}
                  </input>
                  <img
                    src={trashCan}
                    class={styles.trashCan}
                    onclick={() => {
                      setShouldEdit(false);
                      deleteChecklistItem(i());
                    }}
                  />
                </form>
              )}
            </li>
          );
        }}
      </For>
    </ul>
  );
};

type ChecklistProps = {
  listIndex: number;
  addItem: (i: number, index: number, item: string) => void;
  toggleItem: (i: number) => void;
  itemIndex: number;
  deleteChecklistItem: (i: number) => void;
};
