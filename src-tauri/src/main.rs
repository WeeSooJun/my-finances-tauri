#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod database;
mod state;
mod transaction;

use rusqlite::Result;
use state::{AppState, ServiceAccess};
use std::fs;
use tauri::{AppHandle, Manager, State};
use transaction::Transaction;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn is_database_initialized(app_handle: AppHandle) -> bool {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist.");
    fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
    let sqlite_path = app_dir.join("MyFinances.sqlite");
    match fs::metadata(sqlite_path) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn set_database_passphrase(app_handle: AppHandle, passphrase: String) -> bool {
    let app_state: State<AppState> = app_handle.state();
    // let db = database::initialize_database(&app_handle, passphrase)
    //     .expect("Database initialize should succeed");
    let db = match database::initialize_database(&app_handle, passphrase) {
        Ok(result) => result,
        Err(_) => return false,
    };
    *app_state.db.lock().unwrap() = Some(db);
    true
}

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// #[tauri::command]
// fn return_string(word: String) -> String {
//     println!("{}", word);
//     return word;
// }

#[tauri::command]
fn add_new_transaction_type(app_handle: AppHandle, new_type: String) -> bool {
    match app_handle.db(|db| database::add_new_transaction_type(&new_type, db)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn add_new_category(app_handle: AppHandle, new_category: String) -> bool {
    match app_handle.db(|db| database::add_new_category(&new_category, db)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn add_new_bank(app_handle: AppHandle, new_bank: String) -> bool {
    match app_handle.db(|db| database::add_new_bank(&new_bank, db)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn add_new_transaction(app_handle: AppHandle, new_transaction: Transaction) -> bool {
    match app_handle.db(|db| database::add_new_transaction(new_transaction, db)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn get_transactions(app_handle: AppHandle) -> Vec<Transaction> {
    app_handle
        .db(|db| database::get_transactions(db))
        .expect("no db error")
}

#[tauri::command]
fn get_types_for_field(app_handle: AppHandle, field_name: String) -> Vec<String> {
    app_handle
        .db(|db| database::get_types_for_field(db, &field_name))
        .expect("no db error")
}

#[tauri::command]
fn process_xlsx(app_handle: AppHandle) {
    println!("test");
}

fn main() -> Result<()> {
    tauri::Builder::default()
        .manage(AppState {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            // greet,
            // return_string,
            add_new_transaction_type,
            add_new_category,
            add_new_bank,
            add_new_transaction,
            get_transactions,
            is_database_initialized,
            set_database_passphrase,
            get_types_for_field,
            process_xlsx
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
