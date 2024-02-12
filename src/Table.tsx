import { For, Setter, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { NewTransaction, Transaction } from "./Main";
import { addNewTransaction, deleteTransaction, getTransactions } from "./api";
import dayjs, { Dayjs } from "dayjs";
import TableRow from "./TableRow";

interface RowWithFieldValuesProps {
  transaction?: Transaction;
  transactionTypesOptions: string[];
  categories: string[];
  banks: string[];
}

interface TableProps {
  showNewEntry: boolean;
  setShowNewEntry: Setter<boolean>;
  setTransactions: Setter<Transaction[]>;
  transactions: Transaction[];
  transactionTypesOptions: string[];
  categories: string[];
  banks: string[];
}

type TableComponent = Component<TableProps>;

const Table: TableComponent = (props) => {
  const [editTransactionId, setEditTransactionId] = createSignal<number | null>(null);
  const [date, setDate] = createSignal<Dayjs>(dayjs());
  const [name, setName] = createSignal<string>("");
  const [category, setCategory] = createSignal<string>("");
  const [transactionTypes, setTransactionTypes] = createSignal<string[]>([]);
  const [bank, setBank] = createSignal<string>("");
  const [amount, setAmount] = createSignal<number | null>(null);

  // createComputed(() =>{
  // update the local copy whenever the parent updates
  // this fixes the props not updating issue
  // https://github.com/solidjs/solid/discussions/287
  // setCategory(props.categories[0]);
  // setBank(props.banks[0]);
  // })
  const onDeleteClick = async (id: number) => {
    console.log(id);
    await deleteTransaction(id);
    props.setTransactions(await getTransactions());
  };

  return (
    <form
      class="row"
      onSubmit={async (e) => {
        e.preventDefault();
        // TODO: fix bug here and convert to controlled components for row input
        const transaction: NewTransaction = {
          date: date()!,
          name: name(),
          category: category(),
          transactionTypes: Array.from(transactionTypes()),
          bank: bank(),
          amount: amount()!,
        };
        await addNewTransaction(transaction);
        props.setShowNewEntry(false);
        props.setTransactions(await getTransactions());
        setDate(dayjs);
        setName("");
        setCategory("");
        setTransactionTypes([]);
        setBank("");
        setAmount(null);
      }}
    >
      <table>
        <thead>
          <tr>
            <th>Date (DD/MM/YYYY)</th>
            <th>Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Bank</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.showNewEntry &&
            TableRow({
              transactionTypesOptions: props.transactionTypesOptions,
              categories: props.categories,
              banks: props.banks,
              setDate,
              setName,
              setCategory,
              setTransactionTypes,
              setBank,
              setAmount,
            })}
          {
            <For each={props.transactions}>
              {(txn, i) =>
                TableRow({
                  transactionInput: txn,
                  transactionTypesOptions: props.transactionTypesOptions,
                  onDeleteClick,
                  categories: props.categories,
                  banks: props.banks,
                  setDate,
                  setName,
                  setCategory,
                  setTransactionTypes,
                  setBank,
                  setAmount,
                })
              }
            </For>
          }
        </tbody>
      </table>
      <button style={{ visibility: "hidden", width: 0, height: 0, position: "absolute" }} type="submit" />{" "}
      {/* I need this here in order for the enter button to work */}
    </form>
  );
};

export default Table;
