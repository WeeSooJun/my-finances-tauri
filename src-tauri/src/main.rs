mod database;
mod state;

use rusqlite::Result;
use state::{AppState, ServiceAccess};
use tauri::{AppHandle, Manager, State};

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
fn add_new_transaction_type(app_handle: AppHandle, new_type: String) -> String {
    println!("Before Insert {}", new_type);
    app_handle
        .db(|db| database::add_item(&new_type, db))
        .unwrap();
    println!("After Insert");
    return new_type;
}

fn main() -> Result<()> {
    tauri::Builder::default()
        .manage(AppState {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            return_string,
            add_new_transaction_type
        ])
        .setup(|app| {
            let handle = app.handle();
            let app_state: State<AppState> = handle.state();
            let db =
                database::initialize_database(&handle).expect("Database initialize should succeed");
            *app_state.db.lock().unwrap() = Some(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
