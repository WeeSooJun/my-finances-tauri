import { Accessor, Setter, createSignal } from "solid-js";
import { Transaction } from "./Main";
import { addNewTransaction, getTransactions } from "./api";
import dayjs, { Dayjs } from "dayjs";

interface NewRowWithFieldValuesProps {
  types: string[];
  categories: string[];
  banks: string[];
}

const renderRow = (transaction: Transaction) => {
  return (
    <tr>
      <td>{transaction.date.format("DD/MM/YYYY")}</td>
      <td>{transaction.name}</td>
      <td>{transaction.category}</td>
      <td>{transaction.transaction_types}</td>
      <td>{transaction.bank}</td>
      <td>{transaction.amount}</td>
    </tr>
  );
};

interface TableProps {
  showNewEntry: Accessor<boolean>;
  setShowNewEntry: Setter<boolean>;
  setTransactions: Setter<Transaction[]>;
  transactions: Accessor<Transaction[]>;
  transactionTypes: Accessor<string[]>;
  categories: Accessor<string[]>;
  banks: Accessor<string[]>;
}

const Table = ({ showNewEntry, setShowNewEntry, transactions, setTransactions, transactionTypes, categories, banks }: TableProps) => {
  const [date, setDate] = createSignal<Dayjs | null>(null);
  const [name, setName] = createSignal<string>("");
  const [selectedCategories, setSelectedCategories] = createSignal<Set<string>>(new Set([]));
  const [transactionType, setTransactionType] = createSignal<string | null>(null);
  const [bank, setBank] = createSignal<string | null>(null);
  const [amount, setAmount] = createSignal<number | null>(null);

  const newRowWithFieldValues = ({ types, categories, banks }: NewRowWithFieldValuesProps) => {
    console.log(date());
    return (
      <>
        <tr>
          <td>
            <input
              type="date"
              value={date() !== null ? (date() as Dayjs).format("YYYY-MM-DD") : new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(dayjs(e.target.value))}
            />
          </td>
          <td>
            <input type="string" value={name()} onChange={(e) => setName(e.target.value)} />
          </td>
          <td>
            <div>
              {categories.map((val) => {
                return (
                  <div>
                    <input
                      type="checkbox"
                      value={val}
                      checked={selectedCategories().has(val)}
                      onChange={(e) =>
                        e.target.checked
                          ? setSelectedCategories((prev) => prev.add(e.target.value))
                          : setSelectedCategories((prev) => {
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
            <select onChange={(e) => setTransactionType(e.target.value)}>
              {types.map((val) => (
                <option>{val}</option>
              ))}
            </select>
          </td>
          <td>
            <select onChange={(e) => setBank(e.target.value)}>
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
        const transaction = {
          date: date()!.toDate(),
          name: name(),
          category: Array.from(selectedCategories()),
          transaction_type: transactionType(),
          bank: bank(),
          amount: amount(),
        };
        // await addNewTransaction(transaction);
        setShowNewEntry(false);
        setTransactions(await getTransactions());
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
          {showNewEntry() && newRowWithFieldValues({ types: transactionTypes(), categories: categories(), banks: banks() })}
          {transactions().map(renderRow)}
        </tbody>
      </table>
      <button style={{ visibility: "hidden", width: 0, height: 0, position: "absolute" }} type="submit" />{" "}
      {/* I need this here in order for the enter button to work */}
    </form>
  );
};

export default Table;
