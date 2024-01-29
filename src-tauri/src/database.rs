use chrono::NaiveDate;
use rusqlite::{ffi::Error, named_params, Connection, Result};
use std::fs;
use tauri::AppHandle;

use crate::transaction::{self, Transaction};

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
                CREATE TABLE IF NOT EXISTS transaction_type (
                    transaction_type_id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS bank (
                    bank_id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS category (
                    category_id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS transactions (
                    transaction_id INTEGER PRIMARY KEY,
                    date TEXT NOT NULL,
                    name TEXT NOT NULL,
                    category_id INT NOT NULL,
                    bank_id TEXT NOT NULL,
                    amount REAL NOT NULL,
                    FOREIGN KEY (category_id) REFERENCES category(category_id),
                    FOREIGN KEY (bank_id) REFERENCES bank(bank_id)
                );
                CREATE TABLE IF NOT EXISTS transaction_type_mapping (
                    transaction_id INT,
                    transaction_type_id INT,
                    PRIMARY KEY (transaction_id, transaction_type_id),
                    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
                    FOREIGN KEY (transaction_type_id) REFERENCES transaction_type(transaction_type_id)
                );

                INSERT OR IGNORE INTO category (name) VALUES ('');
                INSERT OR IGNORE INTO bank (name) VALUES ('');
            ",
    )?;
    tx.commit()?;

    // FOREIGN KEY(type) REFERENCES transaction_type(id),
    // FOREIGN KEY(bank) REFERENCES bank(id)
    // upgrade_database_if_needed(&mut db, existing_user_version)?;

    Ok(db)
}

/// Upgrades the database to the current version.
// pub fn upgrade_database_if_needed(
//     db: &mut Connection,
//     existing_version: u32,
// ) -> Result<(), rusqlite::Error> {
//     if existing_version < CURRENT_DB_VERSION {
//         db.pragma_update(None, "journal_mode", "WAL")?;

//         let tx = db.transaction()?;

//         tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;

//         tx.execute_batch(
//             "
//       CREATE TABLE IF NOT EXISTS items (
//         title TEXT NOT NULL
//       );
//       CREATE TABLE IF NOT EXISTS transaction_type (
//         id INTEGER PRIMARY KEY,
//         name TEXT NOT NULL UNIQUE
//       );
//       CREATE TABLE IF NOT EXISTS bank (
//         id INTEGER PRIMARY KEY,
//         name TEXT NOT NULL UNIQUE
//       );
//       CREATE TABLE IF NOT EXISTS transaction (
//         id INTEGER PRIMARY KEY,
//         date TEXT NOT NULL,
//         name TEXT NOT NULL,
//         type INTEGER NOT NULL,
//         bank INTEGER NOT NULL
//         amount REAL NOT NULL,
//         FOREIGN KEY(type) REFERENCES transaction_type(id),
//         FOREIGN KEY(bank) REFERENCES bank(id)
//       );
//       ",
//         )?;

//         tx.commit()?;
//     }

//     Ok(())
// }

pub fn add_new_transaction_type(new_type: &str, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("INSERT INTO transaction_type (name) VALUES (@new_type)")?;
    statement.execute(named_params! { "@new_type": new_type })?;
    Ok(())
}

pub fn add_new_category(new_category: &str, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("INSERT INTO category (name) VALUES (@new_category)")?;
    statement.execute(named_params! { "@new_category": new_category })?;
    Ok(())
}

pub fn add_new_bank(new_bank: &str, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare("INSERT INTO bank (name) VALUES (@new_bank)")?;
    statement.execute(named_params! { "@new_bank": new_bank })?;
    Ok(())
}

pub fn add_new_transaction(new_transaction: Transaction, db: &mut Connection) -> Result<()> {
    let tx = db.transaction()?;
    let category_id: i32 = tx.query_row(
        "SELECT category_id FROM category WHERE name = ?",
        &[&new_transaction.category],
        |row| row.get(0),
    )?;

    let bank_id: i32 = tx.query_row(
        "SELECT bank_id FROM bank WHERE name = ?",
        &[&new_transaction.bank],
        |row| row.get(0),
    )?;

    tx.execute(
        "INSERT INTO 
            transactions (date, name, category_id, bank_id, amount) 
            VALUES (@date, @name, @category_id, @bank_id, @amount);",
        named_params! {
            "@date": new_transaction.date,
            "@name": new_transaction.name,
            "@category_id": category_id,
            "@bank_id": bank_id,
            "@amount": new_transaction.amount
        },
    )?;
    let transaction_id = tx.last_insert_rowid() as i32;

    for transaction_type_name in &new_transaction.transaction_types {
        let transaction_type_id: i32 = tx.query_row(
            "SELECT transaction_type_id FROM transaction_type WHERE name = ?",
            &[transaction_type_name],
            |row| row.get(0),
        )?;

        if !transaction_type_name.is_empty() {
            tx.execute(
                "INSERT INTO transaction_type_mapping (transaction_id, transaction_type_id) VALUES (?, ?)",
                &[&transaction_id, &transaction_type_id],
            )?;
        }
    }

    tx.commit()
}

pub fn get_transactions(db: &Connection) -> Result<Vec<Transaction>, rusqlite::Error> {
    let mut stmt = db.prepare(
        "
            SELECT
                t.transaction_id,
                t.date,
                t.name,
                c.name,
                group_concat(tt.name),
                b.name,
                t.amount
            FROM transactions t
            JOIN category c ON t.category_id = c.category_id
            LEFT JOIN bank b ON t.bank_id = b.bank_id
            LEFT JOIN transaction_type_mapping ttm ON t.transaction_id = ttm.transaction_id
            LEFT JOIN transaction_type tt ON ttm.transaction_type_id = tt.transaction_type_id
            GROUP BY t.transaction_id;
        ",
    )?;
    let mut transactions: Vec<Transaction> = Vec::new();

    for row in stmt.query_map([], |row| {
        Ok((
            row.get(1)?,
            row.get(2)?,
            row.get(3)?,
            row.get(4).unwrap_or("".to_owned()),
            row.get(5)?,
            row.get(6)?,
        ))
    })? {
        let (date, name, category, transaction_types, bank, amount): (
            NaiveDate,
            String,
            String,
            String,
            String,
            f64,
        ) = row?;

        let transaction_types = transaction_types
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();

        let transaction = Transaction {
            name,
            amount,
            date,
            category,
            bank,
            transaction_types,
        };

        transactions.push(transaction);
    }
    Ok(transactions)
}

pub fn get_types_for_field(
    db: &Connection,
    field_name: &String,
) -> Result<Vec<String>, rusqlite::Error> {
    let query = format!("SELECT name FROM {}", field_name);
    let mut statement = db.prepare(&query)?;
    let rows = statement.query_map([], |row| row.get(0))?;
    rows.collect()
}
