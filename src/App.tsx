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
  const [hasPasswordBeenSet, setHasPasswordBeenSet] = createSignal(true);
  const [showPasswordError, setShowPasswordError] = createSignal<string | null>(null);
  const [showEnterPassword, setShowEnterPassword] = createSignal(true);

  invoke("is_database_initialized").then((res) => setHasPasswordBeenSet(res as boolean));

  async function setPassphrase(passphrase: string) {
    const result = await invoke("set_database_passphrase", { passphrase });
    if (!result) {
      setShowPasswordError("Wrong password, please try again.");
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
              const confirmPasswordInput = document.querySelector("#confirm-password") as HTMLInputElement;
              if (!hasPasswordBeenSet() && passwordInput.value !== confirmPasswordInput.value) {
                setShowPasswordError("The passwords do not match!");
                return;
              }
              await setPassphrase(passwordInput.value);
            }}
          >
            <div class="grid grid-cols-3 items-center">
              Please {hasPasswordBeenSet() ? "enter" : "set"} your password
              <input id="password" type="password" />
              <button type="submit">Enter</button>
            </div>
            {!hasPasswordBeenSet() && (
              <div class="grid grid-cols-3 items-center">
                Confirm your password
                <input id="confirm-password" type="password" />
              </div>
            )}
          </form>
          {showPasswordError() && <div style={{ color: "red" }}>{showPasswordError()}</div>}
        </>
      )}
      {!showEnterPassword() && <Main />}
    </QueryClientProvider>
  );
}

export default App;
