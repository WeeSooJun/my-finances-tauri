use rusqlite::{Connection, Result};

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn return_string(word: String) -> String {
    println!("{}", word);
    return word;
}

#[tauri::command]
fn add_new_transaction_type(new_type: String) -> Result<()> {
    Ok(())
}

pub struct AppState {
    pub db: std::sync::Mutex<Option<Connection>>,
}

fn main() -> Result<()> {
    let conn = Connection::open("transactions.db")?;

    // Create transaction types
    conn.execute(
        "CREATE TABLE IF NOT EXISTS transaction_type (
             id INTEGER PRIMARY KEY,
             type_name TEXT NOT NULL UNIQUE
         )",
        (),
    );

    // Create banks
    conn.execute(
        "CREATE TABLE IF NOT EXISTS bank (
             id INTEGER PRIMARY KEY,
             bank_name TEXT NOT NULL UNIQUE
         )",
        (),
    );

    // Create transaction table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS transaction (
             id INTEGER PRIMARY KEY,
             date TEXT NOT NULL,
             name TEXT NOT NULL,
             type INTEGER NOT NULL,
             bank INTEGER NOT NULL
             amount REAL NOT NULL,
             FOREIGN KEY(type) REFERENCES transaction_type(id),
             FOREIGN KEY(bank) REFERENCES bank(id)
         )",
        (),
    );

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, return_string])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
