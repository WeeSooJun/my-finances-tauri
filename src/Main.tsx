import { createSignal } from "solid-js";
import { addNewBank, addNewCategory, addNewTransactionType, getTypesForField, getTransactions, processXlsx } from "./api";
import NewFieldType from "./NewFieldType";
import { Dayjs } from "dayjs";
import { open } from "@tauri-apps/api/dialog";
import Table from "./Table";

export type Transaction = {
  id: number;
  date: Dayjs;
  name: string;
  category: string;
  transactionTypes: string[];
  bank: string | null;
  amount: number;
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NewTransaction = PartialBy<Transaction, "id">;

const Main = () => {
  const [showNewEntry, setShowNewEntry] = createSignal(false);
  const [transactionTypes, setTransactionTypes] = createSignal<string[]>([]);
  const [categories, setCategories] = createSignal<string[]>([]);
  const [banks, setBanks] = createSignal<string[]>([]);
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);

  getTransactions().then((transactions) => setTransactions(transactions));
  return (
    <div class="container">
      <h1>My Finances!</h1>
      <div>
        <NewFieldType
          fieldName="category"
          fieldSubmit={async (e) => {
            addNewCategory(e);
            setCategories(await getTypesForField("category"));
          }}
        />
        <NewFieldType
          fieldName="transactionType"
          fieldSubmit={async (e) => {
            addNewTransactionType(e);
            setTransactionTypes(await getTypesForField("transaction_type"));
          }}
        />
        <NewFieldType
          fieldName="bank"
          fieldSubmit={async (e) => {
            addNewBank(e);
            setBanks(await getTypesForField("bank"));
          }}
        />
      </div>
      <div>
        <button
          onClick={async () => {
            const selectedFile = await open({
              multiple: false,
              filters: [
                {
                  name: "xlsx",
                  extensions: ["xlsx"],
                },
              ],
            });
            if (selectedFile !== null && !Array.isArray(selectedFile)) {
              await processXlsx(selectedFile);
              setTransactions(await getTransactions());
            } else {
              console.error("Error trying to send file name to rust backend");
            }
          }}
        >
          Import .xlsx
        </button>
        <button
          onClick={async () => {
            setShowNewEntry((current) => !current);
            setCategories(await getTypesForField("category"));
            setTransactionTypes(await getTypesForField("transaction_type"));
            setBanks(await getTypesForField("bank"));
          }}
        >
          {showNewEntry() && "Cancel"}
          {!showNewEntry() && "Add New Entry"}
        </button>
      </div>
      <br />
      <Table
        showNewEntry={showNewEntry()}
        setShowNewEntry={setShowNewEntry}
        transactions={transactions()}
        setTransactions={setTransactions}
        transactionTypesOptions={transactionTypes()}
        categories={categories()}
        banks={banks()}
      />
    </div>
  );
};

export default Main;
