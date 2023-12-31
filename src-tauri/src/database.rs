use rusqlite::{named_params, Connection};
use std::fs;
use tauri::AppHandle;

const CURRENT_DB_VERSION: u32 = 1;
// Credit to RandomEngy https://github.com/RandomEngy/tauri-sqlite/blob/main/src-tauri/src/database.rs
/// Initializes the database connection, creating the .sqlite file if needed, and upgrading the database
/// if it's out of date.
pub fn initialize_database(
    app_handle: &AppHandle,
    passphrase: String,
) -> Result<Connection, rusqlite::Error> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist.");
    fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
    let sqlite_path = app_dir.join("MyFinances.sqlite");

    let mut db = Connection::open(sqlite_path)?;
    // Maybe can consider combining the 2 lines below
    db.execute("PRAGMA cipher_compatibility = '4';", []);

    db.execute(&format!("PRAGMA key ='{}';", passphrase), []);

    let mut user_pragma = db.prepare("PRAGMA user_version")?;
    let existing_user_version: u32 = user_pragma.query_row([], |row| Ok(row.get(0)?))?;
    drop(user_pragma);

    let tx = db.transaction()?;
    tx.execute_batch(
        "
  CREATE TABLE IF NOT EXISTS items (
    title TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS transaction_type (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS bank (
    id INTEGER PRIMARY KEY,
    bank_name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    type INTEGER NOT NULL,
    bank INTEGER NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(type) REFERENCES transaction_type(id),
    FOREIGN KEY(bank) REFERENCES bank(id)
  );
  ",
    )?;
    tx.commit()?;

    // upgrade_database_if_needed(&mut db, existing_user_version)?;

    Ok(db)
}

/// Upgrades the database to the current version.
pub fn upgrade_database_if_needed(
    db: &mut Connection,
    existing_version: u32,
) -> Result<(), rusqlite::Error> {
    if existing_version < CURRENT_DB_VERSION {
        db.pragma_update(None, "journal_mode", "WAL")?;

        let tx = db.transaction()?;

        tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;

        tx.execute_batch(
            "
      CREATE TABLE IF NOT EXISTS items (
        title TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transaction_type (
        id INTEGER PRIMARY KEY,
        type_name TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS bank (
        id INTEGER PRIMARY KEY,
        bank_name TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS transaction (
        id INTEGER PRIMARY KEY,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        type INTEGER NOT NULL,
        bank INTEGER NOT NULL
        amount REAL NOT NULL,
        FOREIGN KEY(type) REFERENCES transaction_type(id),
        FOREIGN KEY(bank) REFERENCES bank(id)
      );
      ",
        )?;

        tx.commit()?;
    }

    Ok(())
}

pub fn add_item(title: &str, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("INSERT INTO transaction_type (type) VALUES (@title)")?;
    statement.execute(named_params! { "@title": title })?;

    Ok(())
}

pub fn get_all(db: &Connection) -> Result<Vec<String>, rusqlite::Error> {
    let mut statement = db.prepare("SELECT * FROM items")?;
    let mut rows = statement.query([])?;
    let mut items = Vec::new();
    while let Some(row) = rows.next()? {
        let title: String = row.get("title")?;

        items.push(title);
    }

    Ok(items)
}
