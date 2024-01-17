import { invoke } from "@tauri-apps/api/tauri";
import { Transaction } from "./Main";

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
  return await invoke("add_new_transaction", { newTransaction })
}

async function getTypesForField(fieldName: string): Promise<string[]> {
  return await invoke("get_types_for_field", { fieldName })
}

export { addNewCategory, addNewTransactionType, addNewBank, getTypesForField, addNewTransaction }