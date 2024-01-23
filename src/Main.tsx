import { JSX, createSignal } from "solid-js";
import { addNewBank, addNewCategory, addNewTransactionType, getTypesForField, addNewTransaction, getTransactions, processXlsx } from "./api";
import NewFieldType from "./NewFieldType";
import { Dayjs } from "dayjs";
import { open } from "@tauri-apps/api/dialog";

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
          <div>
            {categories.map(val => {return <div><input type="checkbox" value={val} /><label for={val}>{val}</label></div>;})}
          </div>
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
      <div>
        <NewFieldType fieldName="category" fieldSubmit={async (e) => {addNewCategory(e); setCategories(await getTypesForField("category")); }}/>
        <NewFieldType fieldName="transactionType" fieldSubmit={async (e) => {addNewTransactionType(e);setTransactionTypes(await getTypesForField("transaction_type")); }}/>
        <NewFieldType fieldName="bank" fieldSubmit={async (e) => {addNewBank(e); setBanks(await getTypesForField("bank"));}}/>
      </div>
      <div>
        <button onClick={async () => {
          const selectedFile = await open({
            multiple: false,
            filters: [{
              name: 'xlsx',
              extensions: ['xlsx']
            }]
          });
          if (selectedFile !== null && !Array.isArray(selectedFile)) {
            await processXlsx(selectedFile);
          } else {
            console.error("Error trying to send file name to rust backend");
          }
        }}>
          Import .xlsx
        </button>
        <button onClick={async () => {
          setShowNewEntry((current) => !current);
          setCategories(await getTypesForField("category"));
          setTransactionTypes(await getTypesForField("transaction_type"));
          setBanks(await getTypesForField("bank"));
        }}>
          {showNewEntry() && "Cancel"}
          {!showNewEntry() && "Add New Entry"}
        </button>
      </div>
      <br />
      <form
        class="row"
        onSubmit={async (e) => {
          e.preventDefault();
          // TODO: fix bug here and convert to controlled components for row input
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
