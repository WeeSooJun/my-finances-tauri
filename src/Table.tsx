import { Accessor, Setter } from "solid-js";
import { Transaction } from "./Main";
import { addNewTransaction, getTransactions } from "./api";

interface NewRowWithFieldValuesProps {
  types: string[];
  categories: string[];
  banks: string[];
}

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
          <div>
            {categories.map(val => {return <div><input type="checkbox" value={val} /><label for={val}>{val}</label></div>;})}
          </div>
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
          />
        </td>
      </tr>
    </>
  );
};

const renderRow = (transaction: Transaction) => {
  return (<tr>
    <td>{transaction.date.format("DD/MM/YYYY")}</td>
    <td>{transaction.name}</td>
    <td>{transaction.category}</td>
    <td>{transaction.transaction_type}</td>
    <td>{transaction.bank}</td>
    <td>{transaction.amount}</td>
  </tr>);
};

interface TableProps {
  showNewEntry: Accessor<boolean>;
  setShowNewEntry: Setter<boolean>;
  setTransactions: Setter<Transaction[]>;
  transactions: Accessor<Transaction[]>;
  transactionTypes: Accessor<string[]>;
  categories: Accessor<string[]>;
  banks: Accessor<string[]>;
}

const Table = ({ showNewEntry, setShowNewEntry, transactions, setTransactions, transactionTypes, categories, banks}: TableProps) => {
  return (<form
    class="row"
    onSubmit={async (e) => {
      e.preventDefault();
      // TODO: fix bug here and convert to controlled components for row input
      const transaction = {
        date: (e.target as any)[0].value,
        name: (e.target as any)[1].value,
        category: (e.target as any)[2].value,
        transaction_type: (e.target as any)[3].value,
        bank: (e.target as any)[4].value,
        amount: parseFloat((e.target as any)[5].value),
      };
      await(addNewTransaction(transaction));
      setShowNewEntry(false);
      setTransactions(await(getTransactions()));
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
        {transactions().map(renderRow)}
      </tbody>
    </table>
    <button style={{ visibility: "hidden", width: 0, height: 0, position: "absolute" }} type="submit" /> {/* I need this here in order for the enter button to work */}
  </form>);
};

export default Table;