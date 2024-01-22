import { invoke } from "@tauri-apps/api/tauri";
import { Transaction } from "./Main";
import dayjs from "dayjs";

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
  return await invoke("add_new_transaction", { newTransaction });
}

async function processXlsx(filePath: string) {
  return await invoke("process_xlsx", { filePath });
}

type RawTransaction = {
  date: string,
  name: string,
  category: string,
  bank: string,
  transaction_type: string,
  amount: number
}

async function getTransactions(): Promise<Transaction[]> {
  const result: RawTransaction[] = await invoke("get_transactions");
  return result.map(raw => ({ ...raw, date: dayjs(raw.date) }));
}

async function getTypesForField(fieldName: string): Promise<string[]> {
  return await invoke("get_types_for_field", { fieldName });
}

export { addNewCategory, addNewTransactionType, addNewBank, getTypesForField, addNewTransaction, getTransactions, processXlsx }