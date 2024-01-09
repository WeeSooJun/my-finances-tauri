import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, JSXElement } from "solid-js";

interface AuthComponentProps {
  children?: JSXElement;
}

const AuthComponent = ({children}: AuthComponentProps) => {
  const [showSetOrEnter, setShowSetOrEnter] = createSignal(true);
  const [showPasswordError, setShowPasswordError] = createSignal(false);
  const [showEnterPassword, setShowEnterPassword] = createSignal(true);

  invoke("is_database_initialized").then((res) =>
    setShowSetOrEnter(res as boolean)
  );

  async function setPassphrase(passphrase: string) {
    const result = await invoke("set_database_passphrase", { passphrase });
    if (!result) {
      setShowPasswordError(true);
      return;
    }
    setShowEnterPassword(false);
  }
  return <>
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
        {showPasswordError() && <div style={{color: "red"}}>Wrong password, please try again.</div>}
      </>
    )}
    {!showEnterPassword() && children}
  </>;
};

export default AuthComponent;

