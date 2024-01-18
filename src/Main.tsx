import { createSignal } from "solid-js";
import { addNewBank, addNewCategory, addNewTransactionType, getTypesForField, addNewTransaction, getTransactions } from "./api";
import NewFieldType from "./NewFieldType";
import { Dayjs } from "dayjs";

interface NewRowWithFieldValuesProps {
  types: string[];
  categories: string[];
  banks: string[];
}

export type Transaction = {
  date: Dayjs,
  name: string,
  category: string,
  transaction_type: string,
  bank: string,
  amount: number,
};

const newRowWithFieldValues = ({ types, categories, banks }: NewRowWithFieldValuesProps) => {
  return (
    <>
      <tr>
        <td>
          <input
            type="date"
            value={new Date().toISOString().split("T")[0]}
            // onChange={(e) => setDate(Date.parse(e.target.value))}
          />
        </td>
        <td>
          <input type="string" />
        </td>
        <td>
          <select>
            {categories.map(val => <option>{val}</option>)}
          </select>
        </td>
        <td>
          <select>
            {types.map(val => <option>{val}</option>)}
          </select>
        </td>
        <td>
          <select>
            {banks.map(val => <option>{val}</option>)}
          </select>
        </td>
        <td>
          <input
            id="amountBox"
          />
        </td>
      </tr>
    </>
  );
}

const renderRow = (transaction: Transaction) => {
  return (<tr>
    <td>{transaction.date.format("DD/MM/YYYY")}</td>
    <td>{transaction.name}</td>
    <td>{transaction.category}</td>
    <td>{transaction.transaction_type}</td>
    <td>{transaction.bank}</td>
    <td>{transaction.amount}</td>
  </tr>);
}


const Main = () => {
  const [showNewEntry, setShowNewEntry] = createSignal(false);
  const [transactionTypes, setTransactionTypes] = createSignal<string[]>([]);
  const [categories, setCategories] = createSignal<string[]>([]);
  const [banks, setBanks] = createSignal<string[]>([]);
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);

  // onMount(async () => {
  //   await returnShowSetPassword();
  // });

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name: name() }));
  // }

  // async function returnString() {
  //   setStringMsg(await invoke("return_string", { word: string() }));
  // }
  getTransactions().then(transactions => setTransactions(transactions));

  return (
    <div class="container">
      <h1>My Finances!</h1>
      <NewFieldType fieldName="category" fieldSubmit={addNewCategory}/>
      <NewFieldType fieldName="transactionType" fieldSubmit={addNewTransactionType}/>
      <NewFieldType fieldName="bank" fieldSubmit={addNewBank}/>
      <button onClick={async () => {
        setShowNewEntry((current) => !current);
        setCategories(await getTypesForField("category"));
        setTransactionTypes(await getTypesForField("transaction_type"));
        setBanks(await getTypesForField("bank"));
      }}>
        {showNewEntry() && "Cancel"}
        {!showNewEntry() && "Add New Entry"}
      </button>
      <br />
      <form
        class="row"
        onSubmit={async (e) => {
          e.preventDefault();
          const transaction = {
            date: (e.target as any)[0].value,
            name: (e.target as any)[1].value,
            category: (e.target as any)[2].value,
            transaction_type: (e.target as any)[3].value,
            bank: (e.target as any)[4].value,
            amount: parseFloat((e.target as any)[5].value),
          }
          await(addNewTransaction(transaction))
          setShowNewEntry(false);
          setTransactions(await(getTransactions()));
          // await(addNewTransaction())
          // greet();
          // returnString();
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
            {showNewEntry() && newRowWithFieldValues({ types: transactionTypes(),  categories: categories(), banks: banks()} )}
            {transactions().map(renderRow)}
          </tbody>
        </table>
        {/* <input
          id="string-input"
          onChange={(e) => setString(e.currentTarget.value)}
          placeholder="Enter a string"
        />
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />*/}
        <button style={{ visibility: "hidden", width: 0, height: 0, position: "absolute" }} type="submit" /> {/* I need this here in order for the enter button to work */}
      </form>
      {/* <p>{stringMsg()}</p>
      <p>{greetMsg()}</p> */}
    </div>
  );
};

export default Main;
