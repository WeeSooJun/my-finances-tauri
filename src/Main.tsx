import { createSignal } from "solid-js";
import { addNewBank, addNewCategory, addNewTransactionType, getTypesForField, addNewTransaction } from "./api";
import NewFieldType from "./NewFieldType";

interface NewRowWithFieldValuesProps {
  types: string[];
  categories: string[];
  banks: string[];
}

export type Transaction = {
  date: Date,
  name: string,
  category: string,
  transaction_type: string,
  bank: string,
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
            type="number"
          />
        </td>
      </tr>
    </>
  );
}


const Main = () => {
  const [showNewEntry, setShowNewEntry] = createSignal(false);
  const [transactionTypes, setTransactionTypes] = createSignal<string[]>([]);
  const [categories, setCategories] = createSignal<string[]>([]);
  const [banks, setBanks] = createSignal<string[]>([]);

  // const [date, setDate] = createSignal<Date>(new Date());
  // const [name, setName] = createSignal<string>();
  // const [type, setType] = createSignal<string>();
  // const [amount, setAmount] = createSignal<number>();

  // const [types, setTypes] = createSignal<string[]>();

  // const [newType, setNewType] = createSignal<string>();

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
          console.log(e);
          const transaction = {
            date: (e.target as any)[0].value,
            name: (e.target as any)[1].value,
            category: (e.target as any)[2].value,
            transaction_type: (e.target as any)[3].value,
            bank: (e.target as any)[4].value,
            amount: parseFloat((e.target as any)[5].value),
          }
          console.log(transaction);
          await(addNewTransaction(transaction))
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
            <tr>
              <td>15/08/2022</td>
              <td>Fish Soup</td>
              <td>Food</td>
              <td>Paylah</td>
              <td></td>
              <td>4.8</td>
            </tr>
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
