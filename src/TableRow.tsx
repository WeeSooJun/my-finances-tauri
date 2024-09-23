import { Accessor, Component, Setter, createSignal } from "solid-js";
import { Transaction } from "./Main";
import dayjs, { Dayjs } from "dayjs";
import { createQuery } from "@tanstack/solid-query";
import { getTypesForField } from "./api";

interface TableRowProps {
  editTransactionId?: Accessor<number | null>;
  setEditTransactionId?: Setter<number | null>;
  transactionInput?: Transaction;
  onDeleteClick?: (id: number) => Promise<void>;
  setDate: Setter<Dayjs>;
  setName: Setter<string>;
  setCategory: Setter<string>;
  setTransactionTypes: Setter<string[]>;
  setBank: Setter<string>;
  setAmount: Setter<number | null>;
}

type TableRowComponent = Component<TableRowProps>;

const TableRow: TableRowComponent = (props) => {
  // const [date, setDate] = createSignal<Dayjs>(transaction.date);
  // const [name, setName] = createSignal<string>(transaction.name);
  // const [category, setCategory] = createSignal<string>(transaction.category);
  // const [transactionTypes, setTransactionTypes] = createSignal<Set<string>>(new Set(transaction.transactionTypes));
  // const [bank, setBank] = createSignal<string>(transaction.bank);
  // const [amount, setAmount] = createSignal<number>(transaction.amount);

  const categoriesQueryResult = createQuery(() => ({
    queryKey: ["categoriesData"],
    queryFn: async () => {
      const response = await getTypesForField("category");
      return response;
    },
  }));
  const banksQueryResult = createQuery(() => ({
    queryKey: ["banksData"],
    queryFn: async () => {
      const response = await getTypesForField("bank");
      return response;
    },
  }));
  const transactionTypeOptionsQueryResult = createQuery(() => ({
    queryKey: ["transactionTypeOptionsData"],
    queryFn: async () => {
      const response = await getTypesForField("transaction_type");
      return response;
    },
  }));

  const [isHovered, setIsHovered] = createSignal(false);

  const emptyStringArray: string[] = [];

  const transaction = props.transactionInput
    ? props.transactionInput
    : {
        id: 0, // TODO: do something about this 0 later
        date: dayjs(),
        name: "",
        category: "",
        transactionTypes: emptyStringArray,
        bank: "",
        amount: null,
      };

  // console.log(!props.editTransactionId);

  return (
    <>
      {props.transactionInput !== undefined && props.editTransactionId!() !== transaction.id && props.setEditTransactionId && props.onDeleteClick && (
        <tr
          classList={{
            "hover-row": true,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDblClick={() => {
            // hate this but SolidJS still has not type guard
            // already checked on top
            props.setEditTransactionId!(props.transactionInput!.id);
            props.setDate(transaction.date);
            props.setName(transaction.name);
            props.setCategory(transaction.category);
            props.setTransactionTypes(transaction.transactionTypes);
            props.setBank(transaction.bank);
            props.setAmount(transaction.amount);
          }}
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              // hate this but SolidJS still has not type guard
              // already checked on top
              props.setEditTransactionId!(null);
            }
          }}
        >
          <td>{transaction.date.format("DD/MM/YYYY")}</td>
          <td>{transaction.name}</td>
          <td>{transaction.category}</td>
          <td>{transaction.transactionTypes.reduce((prev, curr) => `${prev}, ${curr}`)}</td>
          <td>{transaction.bank}</td>
          <td>{transaction.amount}</td>
          <td class="border-none">
            <button
              type="button"
              classList={{ "opacity-0": !isHovered(), "opacity-1": isHovered() }}
              onClick={() => props.onDeleteClick!(transaction.id)}
            >
              X
            </button>
          </td>
        </tr>
      )}
      {(props.transactionInput === undefined || props.editTransactionId!() === transaction.id) && (
        <tr
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Escape" && props.setEditTransactionId !== undefined) {
              // implementation of new and edit row is a bit convoluted now as
              // exit mechanism for edit is ESC but for create it's cancel button
              props.setEditTransactionId(null);
            }
          }}
        >
          <td>
            <input type="date" value={(transaction.date as Dayjs).format("YYYY-MM-DD")} onChange={(e) => props.setDate(dayjs(e.target.value))} />
          </td>
          <td>
            <input type="string" value={transaction.name} onChange={(e) => props.setName(e.target.value)} />
          </td>
          <td>
            <select value={transaction.category} onChange={(e) => props.setCategory(e.target.value)}>
              {categoriesQueryResult.data!.map(
                (
                  val, // TODO: deal with loading states later
                ) => (
                  <option>{val}</option>
                ),
              )}
            </select>
          </td>
          <td>
            <div>
              {transactionTypeOptionsQueryResult.data!.map((val) => {
                // TODO: deal with loading states later
                return (
                  <div>
                    <input
                      type="checkbox"
                      value={val}
                      checked={transaction.transactionTypes.includes(val)}
                      onChange={(e) =>
                        e.target.checked
                          ? props.setTransactionTypes((prev) => prev.concat([e.target.value]))
                          : props.setTransactionTypes((prev) => {
                              return prev.filter((ele) => e.target.value !== ele);
                            })
                      }
                    />
                    <label for={val}>{val}</label>
                  </div>
                );
              })}
            </div>
          </td>
          <td>
            <select value={transaction.bank} onChange={(e) => props.setBank(e.target.value)}>
              {banksQueryResult.data!.map(
                (
                  val, // TODO: deal with loading states later
                ) => (
                  <option>{val}</option>
                ),
              )}
            </select>
          </td>
          <td>
            <input
              onChange={(e) => {
                props.setAmount(parseFloat(e.target.value));
              }}
              value={transaction.amount !== null ? (transaction.amount as number) : ""}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default TableRow;
