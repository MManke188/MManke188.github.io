import { Component } from 'solid-js';
import styles from '../../App.module.css';
import trashCan from '../../assets/trashCan.png';
import arrow from '../../assets/arrow.png';
import plusIcon from '../../assets/plusIcon.png';
import { Checklist } from './Checklist';
import { ChecklistItem } from './List';

export const Item: Component<ItemProps> = (props) => {
  let inputRef: HTMLInputElement | undefined;
  return (
    <div class={styles.item}>
      {props.title ? (
        <>
          <div
            style={{
              display: 'flex',
              'flex-direction': 'row',
              'align-items': 'center',
              'justify-content': 'space-between',
            }}
          >
            <p class={styles.itemTitle}>{props.title}</p>
            <div>
              <img
                src={trashCan}
                class={styles.trashCan}
                onclick={() => props.deleteItem(props.index)}
              />
              <img
                src={arrow}
                class={styles.arrowRight}
                onclick={() => props.moveItem(props.index)}
              />
            </div>
          </div>
          {props.checkList?.length && (
            <Checklist
              items={props.checkList}
              addItem={props.addChecklist}
              itemIndex={props.index}
              toggleItem={(i: number) =>
                props.toggleChecklistItem(props.index, i)
              }
              deleteChecklistItem={(i: number) =>
                props.deleteChecklistItem(props.index, i)
              }
            />
          )}
          <div>
            <img
              src={arrow}
              class={styles.arrowUp}
              onclick={() => props.moveUp(props.index)}
            />
            <img
              src={plusIcon}
              class={styles.plusIcon}
              onclick={() => props.addChecklist(props.index)}
            />
            <img
              src={arrow}
              class={styles.arrowDown}
              onclick={() => props.moveDown(props.index)}
            />
          </div>
        </>
      ) : (
        <form
          onsubmit={() => {
            props.addItem(inputRef?.value || 'A sad item without a title');
          }}
        >
          <input ref={inputRef} class={styles.input} placeholder="Add Item" />
        </form>
      )}
    </div>
  );
};

type ItemProps = {
  title: string;
  index: number;
  addItem: (title?: string) => void;
  deleteItem: (i: number) => void;
  moveItem: (i: number) => void;
  addChecklist: (i: number, ingredient?: string) => void;
  checkList?: ChecklistItem[];
  toggleChecklistItem: (itemIndex: number, checkListItemIndex: number) => void;
  moveUp: (i: number) => void;
  moveDown: (i: number) => void;
  deleteChecklistItem: (itemIndex: number, checkListItemIndex: number) => void;
};
