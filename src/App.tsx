import "./App.css";
import AuthComponent from "./AuthComponent";
import Main from "./Main";

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

function App() {
  return (
    <AuthComponent>
      <Main />
    </AuthComponent>
  );
}

export default App;
