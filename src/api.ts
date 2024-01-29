import { invoke } from "@tauri-apps/api/tauri";
import { Transaction } from "./Main";
import dayjs from "dayjs";

function convertCamelToSnake(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
      return obj; // If not an object, return as is
  }

  if (Array.isArray(obj)) {
      return obj.map((item) => convertCamelToSnake(item)); // Recursively convert array elements
  }

  const result: any = {};
  for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
          const snakeCaseKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
          result[snakeCaseKey] = convertCamelToSnake(obj[key]);
      }
  }

  return result;
}

type TransactionRequest = {
  date: Date;
  name: string;
  category: string;
  transaction_types: string[];
  bank: string;
  amount: number;
}

async function addNewCategory(newCategory: string | undefined): Promise<boolean> {
  return await invoke("add_new_category", { newCategory });
}

async function addNewTransactionType(newType: string | undefined): Promise<boolean> {
  return await invoke("add_new_transaction_type", { newType });
}

async function addNewBank(newBank: string | undefined): Promise<boolean> {
  return await invoke("add_new_bank", { newBank });
}

async function addNewTransaction(newTransaction: Transaction): Promise<boolean> {
  const transactionRequest: TransactionRequest = {...convertCamelToSnake(newTransaction), date: newTransaction.date.format("YYYY-MM-DD") };
  return await invoke("add_new_transaction", { newTransaction: transactionRequest });
}

async function processXlsx(filePath: string) {
  return await invoke("process_xlsx", { filePath });
}

type RawTransaction = {
  date: string;
  name: string;
  category: string;
  bank: string;
  transaction_types: string[];
  amount: number;
};

async function getTransactions(): Promise<Transaction[]> {
  const result: RawTransaction[] = await invoke("get_transactions");
  // TODO: write a snake_case to camelCase converter and vice versa
  return result.map((raw) => ({ ...raw, date: dayjs(raw.date), transaction_types:null, transactionTypes: raw.transaction_types })); 
}

async function getTypesForField(fieldName: string): Promise<string[]> {
  return await invoke("get_types_for_field", { fieldName });
}

export { addNewCategory, addNewTransactionType, addNewBank, getTypesForField, addNewTransaction, getTransactions, processXlsx };
