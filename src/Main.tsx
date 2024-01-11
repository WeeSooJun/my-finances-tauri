import { invoke } from "@tauri-apps/api/tauri";
import { createSignal } from "solid-js";

interface NewRowWithFieldValuesProps {
  types: string[];
}

const newRowWithFieldValues = ({ types }: NewRowWithFieldValuesProps) => {
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
          <select />
        </td>
        <td>
          <select>
            {types.map(val => <option>{val}</option>)}
          </select>
        </td>
        <td>
          <select />
        </td>
        <td>
          <input
            id="amountBox"
            type="number"
            onKeyDown={(e) => {
              if (e.key === "+" || e.key === "e") e.preventDefault();
            }}
          />
        </td>
      </tr>
    </>
  );
}


const Main = () => {
  const [showNewTypeInput, setShowNewTypeInput] = createSignal(false);
  const [showNewEntry, setShowNewEntry] = createSignal(false);
  const [transactionTypes, setTransactionTypes] = createSignal<string[]>([]);

  // const [date, setDate] = createSignal<Date>(new Date());
  // const [name, setName] = createSignal<string>();
  // const [category, setCategory] = createSignal<string>();
  // const [type, setType] = createSignal<string>();
  // const [bank, setBank] = createSignal<string>();
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

  async function addNewTransactionType(newType: string | undefined): Promise<boolean> {
    return await invoke("add_new_transaction_type", { newType });
  }

  async function getTypesForField(fieldName: string): Promise<string[]> {
    return await invoke("get_types_for_field", { fieldName })
  }

  return (
    <div class="container">
      <h1>My Finances!</h1>
      <button onClick={() => {
        setShowNewTypeInput((current) => !current);
      }}>
        {showNewTypeInput() && "Cancel"}
        {!showNewTypeInput() && "Create New Type"}
      </button>
      {showNewTypeInput() && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const newTypeInput = document.querySelector(
              "#newTypeInput"
            ) as HTMLInputElement;
            await addNewTransactionType(newTypeInput.value);
            setShowNewTypeInput(false);
          }}
        >
          <input id="newTypeInput" />
          <button type="submit">Add Type</button>
        </form>
      )}
      <button onClick={async () => {
        setShowNewEntry((current) => !current);
        setTransactionTypes(await getTypesForField("transaction_type"));
      }}>
        {showNewEntry() && "Cancel"}
        {!showNewEntry() && "Add New Entry"}
      </button>
      <br />
      <form
        class="row"
        onSubmit={(e) => {
          e.preventDefault();
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
            {showNewEntry() && newRowWithFieldValues({ types: transactionTypes()} )}
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
        />
        <button type="submit">Greet</button> */}
      </form>
      {/* <p>{stringMsg()}</p>
      <p>{greetMsg()}</p> */}
    </div>
  );
};

export default Main;
