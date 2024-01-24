import { createSignal } from "solid-js";

interface NewFieldTypeProps {
  fieldName: string;
  fieldSubmit: (name: string) => void;
}

function convertCamelCaseToView(str: string) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char.toUpperCase() === char && result !== "") {
      result += " " + char;
    } else {
      result += char;
    }
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const NewFieldType = ({ fieldName, fieldSubmit }: NewFieldTypeProps) => {
  const [showNewTypeInput, setShowNewTypeInput] = createSignal(false);

  return (<>
    <button onClick={() => {
      setShowNewTypeInput((current) => !current);
    }}>
      {showNewTypeInput() && "Cancel"}
      {!showNewTypeInput() && `Create ${convertCamelCaseToView(fieldName)}`}
    </button>
    {showNewTypeInput() && (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const newTypeInput = document.querySelector(
            `#newTypeInput-${fieldName}`
          ) as HTMLInputElement;
          await fieldSubmit(newTypeInput.value);
          setShowNewTypeInput(false);
        }}
      >
        <input id={`newTypeInput-${fieldName}`} />
        <button type="submit">Add Type</button>
      </form>
    )}
  </>);
};

export default NewFieldType;