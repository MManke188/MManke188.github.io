import { Component, For } from 'solid-js';
import styles from '../../App.module.css';
import {
  itemOrder,
  setItemOrder,
  setStore,
  store,
} from '../../helper/listFunctions';
import { Item } from './Item';

export const List: Component<{ index: number }> = ({ index }) => {
  let inputRef: HTMLInputElement | undefined;

  const addItem = (title?: string) => {
    setStore('lists', index, (prev) => ({
      ...prev,
      items: prev.items.length
        ? ([
            ...prev.items.slice(0, prev.items.length - 1),
            { title: title || '' },
            {},
          ] as unknown as Item[])
        : ([[]] as unknown as Item[]),
    }));
  };
  const deleteItem = (i: number) => {
    setStore('lists', index, (prev) => ({
      ...prev,
      items: [...prev.items.slice(0, i), ...prev.items.slice(i + 1)],
    }));
  };

  const moveItem = (i: number) => {
    if (index === 0) {
      setStore('lists', index + 1, 'items', (prev) => {
        const itemsToAdd = [];
        if (store.lists[index].items[i].checkList?.length) {
          const checklistToAdd = store.lists[index].items[i].checkList
            ?.filter(({ checked }) => !checked)
            .map(({ title }) => ({ title, checkList: [] }));
          itemsToAdd.push(...checklistToAdd!);
        } else {
          itemsToAdd.push(store.lists[index].items[i]);
        }

        const countedItems: Item[] = [];

        itemsToAdd.forEach((item) => {
          const title = titleSlicer(item.title);
          const index = countedItems.findIndex(
            (i) => titleSlicer(i.title) === title
          );

          if (index !== -1) {
            const amount = amountSlicer(item.title);
            const updatedAmount =
              amountSlicer(countedItems[index].title) + amount;
            countedItems[index].title = `${title} (${updatedAmount})`;
          } else {
            countedItems.push({
              title: item.title,
              checkList: item.checkList,
            });
          }
        });

        prev.forEach((item) => {
          const title = titleSlicer(item.title);
          const index = countedItems.findIndex(
            (i) => titleSlicer(i.title) === title
          );

          if (index !== -1) {
            const amount = amountSlicer(item.title);
            const updatedAmount =
              amountSlicer(countedItems[index].title) + amount;
            countedItems[index].title = `${title} (${updatedAmount})`;
          } else {
            countedItems.push(item);
          }
        });

        //append new items to the itemOrder
        countedItems.forEach((item) => {
          const title = titleSlicer(item.title);
          if (!itemOrder.includes(title)) {
            setItemOrder((prev) => [title, ...prev]);
          }
        });

        countedItems.sort((a, b) => {
          const aIndex = itemOrder.indexOf(titleSlicer(a.title));
          const bIndex = itemOrder.indexOf(titleSlicer(b.title));

          return aIndex - bIndex;
        });

        return countedItems;
      });
    } else {
      // add item to the very first list
      setStore('lists', 0, (prev) => ({
        ...prev,
        items: [
          ...prev.items.slice(0, prev.items.length - 1),
          store.lists[index].items[i],
          ...prev.items.slice(prev.items.length - 1),
        ],
      }));
    }
    !store.lists[index].items[i].checkList && deleteItem(i);
  };

  const addTitle = (title: string) => {
    setStore('lists', index, (prev) => ({
      ...prev,
      title,
    }));
  };

  const addChecklist = (i: number) => {
    setStore('lists', index, 'items', [i], 'checkList', (prev) =>
      prev ? [...prev, { title: '', checked: false }] : []
    );
  };

  const addChecklistItem = (
    i: number,
    ingredientIndex: number,
    ingredient: string
  ) => {
    setStore('lists', index, 'items', [i], 'checkList', (prev) => [
      ...prev!.slice(0, ingredientIndex),
      { title: ingredient, checked: false },
      ...prev!.slice(ingredientIndex + 1),
    ]);
  };

  const toggleChecklistItem = (
    itemIndex: number,
    checkListItemIndex: number
  ) => {
    setStore(
      'lists',
      index,
      'items',
      itemIndex,
      'checkList',
      checkListItemIndex,
      (prev) => ({
        ...prev,
        checked: !prev.checked,
      })
    );
  };

  const deleteChecklistItem = (
    itemIndex: number,
    checkListItemIndex: number
  ) => {
    setStore('lists', index, 'items', itemIndex, 'checkList', (prev) => {
      return prev?.length
        ? [
            ...prev.slice(0, checkListItemIndex),
            ...prev.slice(checkListItemIndex + 1),
          ]
        : [];
    });
  };

  const moveUp = (i: number) => {
    setStore('lists', index, 'items', (prev) => {
      // if the item is the first one, don't move it
      if (i === 0) {
        return prev;
      }

      if (index === 1) {
        //set the new itemorder
        setItemOrder((prevItems) => {
          const index = prevItems.findIndex(
            //possibility of i being 0 is already excluded
            (e) => e === titleSlicer(prev[i - 1].title)
          );

          const newItemOrder = [
            ...prevItems.slice(0, index),
            titleSlicer(prev[i].title),
            ...prevItems
              .slice(index)
              .filter((e) => e !== titleSlicer(prev[i].title)),
          ];

          return newItemOrder;
        });
      }

      return [
        ...prev.slice(0, i - 1),
        prev[i],
        prev[i - 1],
        ...prev.slice(i + 1),
      ];
    });
  };

  const moveDown = (i: number) => {
    setStore('lists', index, 'items', (prev) => {
      // if the item is the last one, don't move it
      if (i === prev.length - 1) {
        return prev;
      }

      if (index === 1) {
        //set the new itemorder
        setItemOrder((prevItems) => {
          const index = prevItems.findIndex(
            //possibility of i being the last one is already excluded
            (e) => e === titleSlicer(prev[i + 1].title)
          );

          const newItemOrder = [
            ...prevItems
              .slice(0, index + 1)
              .filter((e) => e !== titleSlicer(prev[i].title)),
            titleSlicer(prev[i].title),
            ...prevItems.slice(index + 1),
          ];

          return newItemOrder;
        });
      }

      return [...prev.slice(0, i), prev[i + 1], prev[i], ...prev.slice(i + 2)];
    });
  };

  return (
    <div class={styles.list}>
      {store.lists[index].title ? (
        <>
          <p class={styles.listTitle}>{store.lists[index].title}</p>
          <For each={store.lists[index].items}>
            {(item, i) => {
              return (
                <Item
                  {...{
                    title: item.title,
                    index: i(),
                    addItem,
                    deleteItem,
                    moveItem,
                    addChecklist,
                    addChecklistItem,
                    listIndex: index,
                    toggleChecklistItem,
                    moveUp,
                    moveDown,
                    deleteChecklistItem,
                  }}
                />
              );
            }}
          </For>
        </>
      ) : (
        <form
          onsubmit={() => {
            addTitle(inputRef?.value || 'A sad list without a title');
            addItem();
          }}
        >
          <input
            ref={inputRef}
            class={styles.listTitleInput}
            placeholder="Enter title here"
          />
        </form>
      )}
    </div>
  );
};

export type List = {
  title: string;
  items: Item[];
};

export type Item = {
  title: string;
  checkList?: ChecklistItem[];
};

export type ChecklistItem = {
  title: string;
  checked: boolean;
};

const titleSlicer = (title: string) => {
  return title.indexOf('(') !== -1
    ? title.slice(0, title.indexOf('(') - 1)
    : title;
};

const amountSlicer = (title: string) => {
  return title.indexOf('(') !== -1
    ? Number(title.slice(title.indexOf('(') + 1, title.indexOf(')')))
    : 1;
};
