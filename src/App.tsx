import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

// interface FormElements extends HTMLFormControlsCollection {
//   password: HTMLInputElement;
// }

// interface PasswordFormElement extends HTMLFormElement {
//   readonly elements: FormElements;
// }

interface SingleTarget {
  value: string;
}

interface FormEvent {
  target: SingleTarget[];
}

function App() {
  const [showSetOrEnter, setShowSetOrEnter] = createSignal(true);
  const [showEnterPassword, setShowEnterPassword] = createSignal(true);
  const [showNewEntry, setShowNewEntry] = createSignal(false);
  const [date, setDate] = createSignal<Date>(new Date());
  const [name, setName] = createSignal<string>();
  const [category, setCategory] = createSignal<string>();
  const [type, setType] = createSignal<string>();
  const [bank, setBank] = createSignal<string>();
  const [amount, setAmount] = createSignal<number>();

  const [types, setTypes] = createSignal<string[]>();

  const [newType, setNewType] = createSignal<string>();
  const [showNewTypeInput, setShowNewTypeInput] = createSignal(false);

  // onMount(async () => {
  //   await returnShowSetPassword();
  // });

  const emptyRow = (
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
          <select />
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

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name: name() }));
  // }

  // async function returnString() {
  //   setStringMsg(await invoke("return_string", { word: string() }));
  // }
  invoke("is_database_initialized").then((res) =>
    setShowSetOrEnter(res as boolean)
  );

  async function addNewTransactionType(newType: string) {
    await invoke("add_new_transaction_type", { newType });
  }

  async function setPassphrase(passphrase: string) {
    const result = await invoke("set_database_passphrase", { passphrase });
    if (result) {
      setShowEnterPassword(false);
    }
  }

  return (
    <>
      {showEnterPassword() && (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const passwordInput = document.querySelector(
                "#password"
              ) as HTMLInputElement;
              await setPassphrase(passwordInput.value);
            }}
          >
            Please {showSetOrEnter() ? "enter" : "set"} your password
            <input id="password" />
            <button type="submit">Enter</button>
          </form>
        </>
      )}
      {!showEnterPassword() && (
        <div class="container">
          <h1>My Finances!</h1>
          <button onClick={() => setShowNewTypeInput((current) => !current)}>
            {showNewTypeInput() && "Cancel"}
            {!showNewTypeInput() && "Create New Type"}
          </button>
          {showNewTypeInput() && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newTypeInput = document.querySelector(
                  "#newTypeInput"
                ) as HTMLInputElement;
                addNewTransactionType(newTypeInput.value);
              }}
            >
              <input id="newTypeInput" />
              <button type="submit">Add Type</button>
            </form>
          )}
          <button onClick={() => setShowNewEntry((current) => !current)}>
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
                {showNewEntry() && emptyRow}
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
      )}
    </>
  );
}

export default App;
