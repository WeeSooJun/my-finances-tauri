import { Setter, createSignal } from "solid-js";
import { NewTransaction, Transaction } from "./Main";
import dayjs, { Dayjs } from "dayjs";

interface TableRowProps {
  transactionInput?: Transaction;
  transactionTypesOptions: string[];
  categories: string[];
  banks: string[];
  setDate: Setter<Dayjs>;
  setName: Setter<string>;
  setCategory: Setter<string>;
  setTransactionTypes: Setter<Set<string>>;
  setBank: Setter<string>;
  setAmount: Setter<number>;
}

const TableRow = ({ transactionInput, transactionTypesOptions, categories, banks, setDate, setName, setCategory, setTransactionTypes, setBank, setAmount }: TableRowProps) => {
  // const [date, setDate] = createSignal<Dayjs>(transaction.date);
  // const [name, setName] = createSignal<string>(transaction.name);
  // const [category, setCategory] = createSignal<string>(transaction.category);
  // const [transactionTypes, setTransactionTypes] = createSignal<Set<string>>(new Set(transaction.transactionTypes));
  // const [bank, setBank] = createSignal<string>(transaction.bank);
  // const [amount, setAmount] = createSignal<number>(transaction.amount);

  const emptyStringArray: string[] = [];

  const transaction = transactionInput ? transactionInput : {
    date: dayjs(),
    name: "",
    category: "",
    transactionTypes: emptyStringArray,
    bank: "",
    amount: null
  }

  return (
    <>
      {transaction && 
      <tr>
        <td>
          <input type="date" value={(transaction.date as Dayjs).format("YYYY-MM-DD")} onChange={(e) => setDate(dayjs(e.target.value))} />
        </td>
        <td>
          <input type="string" value={transaction.name} onChange={(e) => setName(e.target.value)} />
        </td>
        <td>
          <select value={transaction.category} onChange={(e) => setCategory(e.target.value)}>
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
                    checked={transaction.transactionTypes.includes(val)}
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
          <select value={transaction.bank} onChange={(e) => setBank(e.target.value)}>
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
            value={transaction.amount !== null ? (transaction.amount as number) : ""}
          />
        </td>
      </tr>}
    </>
  );
};

export default TableRow;