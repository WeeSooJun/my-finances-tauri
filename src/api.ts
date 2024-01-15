import { invoke } from "@tauri-apps/api/tauri";

async function addNewCategory(newCategory: string | undefined): Promise<boolean> {
  return await invoke("add_new_category", { newCategory });
}

async function addNewTransactionType(newType: string | undefined): Promise<boolean> {
  return await invoke("add_new_transaction_type", { newType });
}

async function addNewBank(newBank: string | undefined): Promise<boolean> {
  return await invoke("add_new_bank", { newBank });
}


async function getTypesForField(fieldName: string): Promise<string[]> {
  return await invoke("get_types_for_field", { fieldName })
}

export { addNewCategory, addNewTransactionType, addNewBank, getTypesForField }