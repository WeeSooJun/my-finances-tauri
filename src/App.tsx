import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [showNewEntry, setShowNewEntry] = createSignal(false);
  const [date, setDate] = createSignal<Date>(new Date());
  const [name, setName] = createSignal<string>("");
  const [category, setCategory] = createSignal<string>("");
  const [type, setType] = createSignal<string>("");
  const [bank, setBank] = createSignal<string>("");
  const [amount, setAmount] = createSignal<number>();

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

  return (
    <div class="container">
      <h1>My Finances!</h1>
      <button onClick={() => setShowNewEntry((current) => !current)}>
        {showNewEntry() && "Cancel"}
        {!showNewEntry() && "Create"}
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
              <th>Date</th>
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
              <td>15-Aug</td>
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
}

export default App;
