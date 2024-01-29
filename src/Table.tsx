import { Setter, createComputed, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { Transaction } from "./Main";
import { addNewTransaction, getTransactions } from "./api";
import dayjs, { Dayjs } from "dayjs";

interface NewRowWithFieldValuesProps {
  transactionTypesOptions: string[];
  categories: string[];
  banks: string[];
}

const renderRow = (transaction: Transaction) => {
  return (
    <tr>
      <td>{transaction.date.format("DD/MM/YYYY")}</td>
      <td>{transaction.name}</td>
      <td>{transaction.category}</td>
      <td>{transaction.transactionTypes}</td>
      <td>{transaction.bank}</td>
      <td>{transaction.amount}</td>
    </tr>
  );
};

interface TableProps {
  showNewEntry: boolean;
  setShowNewEntry: Setter<boolean>,
  setTransactions: Setter<Transaction[]>,
  transactions: Transaction[],
  transactionTypesOptions: string[],
  categories: string[],
  banks: string[],
}

type TableComponent = Component<TableProps>;

const Table: TableComponent = (props) => {
  const [date, setDate] = createSignal<Dayjs>(dayjs());
  const [name, setName] = createSignal<string>("");
  const [category, setCategory] = createSignal<string>("");
  const [transactionTypes, setTransactionTypes] = createSignal<Set<string>>(new Set([]));
  const [bank, setBank] = createSignal<string>("");
  const [amount, setAmount] = createSignal<number | null>(null);

  // createComputed(() =>{
    // update the local copy whenever the parent updates
    // this fixes the props not updating issue
    // https://github.com/solidjs/solid/discussions/287
    // setCategory(props.categories[0]);
    // setBank(props.banks[0]);
  // })

  const newRowWithFieldValues = ({ transactionTypesOptions, categories, banks }: NewRowWithFieldValuesProps) => {
    return (
      <>
        <tr>
          <td>
            <input
              type="date"
              value={(date() as Dayjs).format("YYYY-MM-DD")}
              onChange={(e) => setDate(dayjs(e.target.value))}
            />
          </td>
          <td>
            <input type="string" value={name()} onChange={(e) => setName(e.target.value)} />
          </td>
          <td>
            <select value={category()} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((val) => (
                <option>{val}</option>
              ))}
            </select>
          </td>
          <td>
            <div>
                {transactionTypesOptions.map((val) => {
                  return (
                    <div>
                      <input
                        type="checkbox"
                        value={val}
                        checked={transactionTypes().has(val)}
                        onChange={(e) =>
                          e.target.checked
                            ? setTransactionTypes((prev) => prev.add(e.target.value))
                            : setTransactionTypes((prev) => {
                                prev.delete(e.target.value);
                                return prev;
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
            <select value={bank()} onChange={(e) => setBank(e.target.value)}>
              {banks.map((val) => (
                <option>{val}</option>
              ))}
            </select>
          </td>
          <td>
            <input
              onChange={(e) => {
                setAmount(parseFloat(e.target.value));
              }}
              value={amount() !== null ? (amount() as number) : ""}
            />
          </td>
        </tr>
      </>
    );
  };

  return (
    <form
      class="row"
      onSubmit={async (e) => {
        e.preventDefault();
        // TODO: fix bug here and convert to controlled components for row input
        const transaction: Transaction = {
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
          {props.showNewEntry && newRowWithFieldValues({ transactionTypesOptions: props.transactionTypesOptions, categories: props.categories, banks: props.banks })}
          {props.transactions.map(renderRow)}
        </tbody>
      </table>
      <button style={{ visibility: "hidden", width: 0, height: 0, position: "absolute" }} type="submit" />{" "}
      {/* I need this here in order for the enter button to work */}
    </form>
  );
};

export default Table;
