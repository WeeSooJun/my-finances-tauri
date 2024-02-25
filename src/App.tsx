import { createSignal } from "solid-js";
// import "./App.css";
import Main from "./Main";
import { invoke } from "@tauri-apps/api/tauri";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

// interface FormElements extends HTMLFormControlsCollection {
//   password: HTMLInputElement;
// }

// interface PasswordFormElement extends HTMLFormElement {
//   readonly elements: FormElements;
// }

// interface SingleTarget {
//   value: string;
// }

// interface FormEvent {
//   target: SingleTarget[];
// }

const queryClient = new QueryClient();

function App() {
  const [showSetOrEnter, setShowSetOrEnter] = createSignal(true);
  const [showPasswordError, setShowPasswordError] = createSignal(false);
  const [showEnterPassword, setShowEnterPassword] = createSignal(true);

  invoke("is_database_initialized").then((res) => setShowSetOrEnter(res as boolean));

  async function setPassphrase(passphrase: string) {
    const result = await invoke("set_database_passphrase", { passphrase });
    if (!result) {
      setShowPasswordError(true);
      return;
    }
    setShowEnterPassword(false);
  }
  return (
    <QueryClientProvider client={queryClient}>
      {showEnterPassword() && (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const passwordInput = document.querySelector("#password") as HTMLInputElement;
              await setPassphrase(passwordInput.value);
            }}
          >
            Please {showSetOrEnter() ? "enter" : "set"} your password
            <input id="password" />
            <button type="submit">Enter</button>
          </form>
          {showPasswordError() && <div style={{ color: "red" }}>Wrong password, please try again.</div>}
        </>
      )}
      {!showEnterPassword() && <Main />}
    </QueryClientProvider>
  );
}

export default App;
