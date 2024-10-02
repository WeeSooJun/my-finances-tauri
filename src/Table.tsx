import { For, Setter, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { NewTransaction, Transaction } from "./Main";
import { addNewTransaction, deleteTransaction, editTransaction, getTransactions } from "./api";
import dayjs, { Dayjs } from "dayjs";
import TableRow from "./TableRow";
import { createQuery } from "@tanstack/solid-query";
import { Portal } from "solid-js/web";

interface TableProps {
  showNewEntry: boolean;
  setShowNewEntry: Setter<boolean>;
  // setTransactions: Setter<Transaction[]>;
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
  const [transactionPage, setTransactionPage] = createSignal<number>(0);
  const [showDeleteModal, setDeleteModal] = createSignal<boolean>(false);

  // createComputed(() =>{
  // update the local copy whenever the parent updates
  // this fixes the props not updating issue
  // https://github.com/solidjs/solid/discussions/287
  // setCategory(props.categories[0]);
  // setBank(props.banks[0]);
  // })
  const transactionsQueryResult = createQuery(() => ({
    queryKey: ["transactionsData"],
    queryFn: async () => {
      const response = await getTransactions();
      return response;
    },
  }));

  const onDeleteClick = async (id: number) => {
    // display popup to confirm delete
    
    await onDeleteSubmit(id);
  }

  const onDeleteSubmit = async (id: number) => {
    await deleteTransaction(id);
    await transactionsQueryResult.refetch();
  };
  console.log(date());

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
          transactionTypes: transactionTypes(),
          bank: bank(),
          amount: amount()!,
        };
        if (editTransactionId() === null) {
          await addNewTransaction(transaction);
          props.setShowNewEntry(false);
        } else {
          const transactionToUpdate: Transaction = {
            id: editTransactionId() as number, // SolidJS type guard cmi https://github.com/microsoft/TypeScript/issues/53178
            ...transaction,
          };
          await editTransaction(transactionToUpdate);
          setEditTransactionId(null);
        }
        await transactionsQueryResult.refetch();
        setDate(dayjs());
        setName("");
        setCategory("");
        setTransactionTypes([]);
        setBank("");
        setAmount(null);
      }}
    >
      {/* <Portal><div class="bg-black fixed left-0 top-0 overflow-auto w-full h-full bg-opacity-40 "><div class="bg-white ml-[25%] mr-[25%] mt-[25%] mb-[25%]">TEST</div></div></Portal> */}
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
              setDate,
              setName,
              setCategory,
              setTransactionTypes,
              setBank,
              setAmount,
            })}
          {
            <For each={props.transactions}>
              {(txn) =>
                TableRow({
                  editTransactionId,
                  setEditTransactionId,
                  transactionInput: txn,
                  onDeleteClick,
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
