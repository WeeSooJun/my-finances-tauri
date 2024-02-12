import { Setter, createSignal } from "solid-js";
import { NewTransaction, Transaction } from "./Main";
import dayjs, { Dayjs } from "dayjs";

interface TableRowProps {
  isEdit?: boolean;
  setEditTransactionId?: Setter<number>;
  transactionInput?: Transaction;
  transactionTypesOptions: string[];
  onDeleteClick?: (id: number) => Promise<void>;
  categories: string[];
  banks: string[];
  setDate: Setter<Dayjs>;
  setName: Setter<string>;
  setCategory: Setter<string>;
  setTransactionTypes: Setter<Set<string>>;
  setBank: Setter<string>;
  setAmount: Setter<number>;
}

const TableRow = ({
  transactionInput,
  transactionTypesOptions,
  onDeleteClick,
  categories,
  banks,
  setDate,
  setName,
  setCategory,
  setTransactionTypes,
  setBank,
  setAmount,
}: TableRowProps) => {
  // const [date, setDate] = createSignal<Dayjs>(transaction.date);
  // const [name, setName] = createSignal<string>(transaction.name);
  // const [category, setCategory] = createSignal<string>(transaction.category);
  // const [transactionTypes, setTransactionTypes] = createSignal<Set<string>>(new Set(transaction.transactionTypes));
  // const [bank, setBank] = createSignal<string>(transaction.bank);
  // const [amount, setAmount] = createSignal<number>(transaction.amount);
  const [isEdit, setIsEdit] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);

  const emptyStringArray: string[] = [];

  const transaction = transactionInput
    ? transactionInput
    : {
        id: 0, // do something about this 0 later
        date: dayjs(),
        name: "",
        category: "",
        transactionTypes: emptyStringArray,
        bank: "",
        amount: null,
      };

  return (
    <>
      {!isEdit() && onDeleteClick && (
        <tr
          classList={{
            "hover-row": true,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDblClick={() => {
            setIsEdit(true);
          }}
          tabIndex="0"
          onKeyDown={(event) => {
            console.log(event);
            if (event.key === "Escape") {
              setIsEdit(false);
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
            <button type="button" classList={{ "opacity-0": !isHovered(), "opacity-1": isHovered() }} onClick={() => onDeleteClick(transaction.id)}>
              X
            </button>
          </td>
        </tr>
      )}
      {(transactionInput === undefined || isEdit()) && (
        <tr tabIndex="0" onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsEdit(false);
          }
        }}>
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
        </tr>
      )}
    </>
  );
};

export default TableRow;
