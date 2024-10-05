use chrono::NaiveDate;
use rusqlite::{named_params, Connection, Result};
use std::fs;
use tauri::AppHandle;

use crate::{transaction::Transaction, util::get_app_dir};

// const CURRENT_DB_VERSION: u32 = 1;
// Credit to RandomEngy https://github.com/RandomEngy/tauri-sqlite/blob/main/src-tauri/src/database.rs
/// Initializes the database connection, creating the .sqlite file if needed, and upgrading the database
/// if it's out of date.
pub fn initialize_database(
    app_handle: &AppHandle,
    passphrase: String,
) -> Result<Connection, rusqlite::Error> {
    let app_dir = get_app_dir(app_handle);
    fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
    let sqlite_path = app_dir.join("database.sqlite");

    let mut db = Connection::open(sqlite_path)?;
    // Maybe can consider combining the 2 lines below
    let _ = db.execute("PRAGMA cipher_compatibility = '4';", []);

    let _ = db.execute(&format!("PRAGMA key ='{}';", passphrase), []);

    let mut user_pragma = db.prepare("PRAGMA user_version")?;
    let _existing_user_version: u32 = user_pragma.query_row([], |row| Ok(row.get(0)?))?;
    drop(user_pragma);

    let tx = db.transaction()?;
    tx.execute_batch(
        "
                CREATE TABLE IF NOT EXISTS transaction_type (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS bank (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS category (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY,
                    date TEXT NOT NULL,
                    name TEXT NOT NULL,
                    category_id INT NOT NULL,
                    bank_id TEXT NOT NULL,
                    amount REAL NOT NULL,
                    FOREIGN KEY (category_id) REFERENCES category(id),
                    FOREIGN KEY (bank_id) REFERENCES bank(id)
                );
                CREATE TABLE IF NOT EXISTS transaction_type_mapping (
                    transaction_id INT,
                    transaction_type_id INT,
                    PRIMARY KEY (transaction_id, transaction_type_id),
                    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
                    FOREIGN KEY (transaction_type_id) REFERENCES transaction_type(id)
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

fn check_string_existence(
    conn: &Connection,
    table_name: &str,
    column_name: &str,
    search_string: &str,
) -> Option<i64> {
    // Build the SQL query
    let query = format!(
        "SELECT id FROM {} WHERE {} = ? LIMIT 1",
        table_name, column_name
    );

    // Prepare the statement
    let mut stmt = conn.prepare(&query).unwrap();

    // Execute the query with the search string as a parameter
    let id: Option<i64> = stmt.query_row(&[search_string], |row| row.get(0)).ok();

    // Return the ID if it exists, None otherwise
    id
}

fn insert_if_not_exists(
    conn: &Connection,
    table_name: &str,
    key_column: &str,
    data: &[String],
) -> Vec<i64> {
    let mut last_insert_ids = vec![];
    for string in data {
        // This feels kinda wonky but it'll do for now I guess
        if table_name == "transaction_type" && string.is_empty() {
            continue;
        }
        if let Some(id) = check_string_existence(conn, table_name, key_column, string) {
            last_insert_ids.push(id)
        } else {
            conn.execute(
                &format!("INSERT INTO {} ({}) VALUES (?)", table_name, key_column),
                &[string],
            )
            .expect("Error executing SQL statement");
            last_insert_ids.push(conn.last_insert_rowid());
        }
    }

    last_insert_ids
}

fn insert_one_if_not_exists(
    conn: &Connection,
    table_name: &str,
    key_column: &str,
    data: String,
) -> Result<i64> {
    let result = insert_if_not_exists(conn, table_name, key_column, &vec![data]);

    if let Some(&last_insert_id) = result.get(0) {
        Ok(last_insert_id)
    } else {
        Err(rusqlite::Error::ExecuteReturnedResults)
    }
}

pub fn add_new_transaction(new_transaction: Transaction, db: &mut Connection) -> Result<()> {
    let tx = db.transaction()?;
    // TODO: split this into another function for security maybe
    // to prevent user from hitting the "endpoint" directly and adding new types
    let category_id = insert_one_if_not_exists(&tx, "category", "name", new_transaction.category)?;

    let bank_id = insert_one_if_not_exists(&tx, "bank", "name", new_transaction.bank)?;

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
    let transaction_id = tx.last_insert_rowid();

    if !new_transaction.transaction_types.is_empty() {
        let transaction_type_ids = insert_if_not_exists(
            &tx,
            "transaction_type",
            "name",
            &new_transaction.transaction_types,
        );

        for transaction_type_id in transaction_type_ids {
            tx.execute(
                "INSERT INTO transaction_type_mapping (transaction_id, transaction_type_id) VALUES (?, ?)",
                &[&transaction_id, &transaction_type_id],
                )?;
        }
    }

    tx.commit()
}

pub fn get_transactions(
    db: &Connection,
    records_per_page: u32,
    key: &str,
) -> Result<Vec<Transaction>, rusqlite::Error> {
    let mut stmt = db.prepare(
        "
            SELECT
                t.id,
                t.date,
                t.name,
                c.name,
                group_concat(tt.name),
                b.name,
                t.amount
            FROM transactions t
            JOIN category c ON t.category_id = c.id
            LEFT JOIN bank b ON t.bank_id = b.id
            LEFT JOIN transaction_type_mapping ttm ON t.id = ttm.transaction_id
            LEFT JOIN transaction_type tt ON ttm.transaction_type_id = tt.id
            WHERE t.date <= :key
            GROUP BY t.id
            ORDER BY t.date DESC, t.id DESC
            LIMIT :limit;
        ",
    )?;
    let mut transactions: Vec<Transaction> = Vec::new();

    for row in stmt.query_map(
        &[
            (":limit", &records_per_page.to_string()),
            (":key", &key.to_string()),
        ],
        |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4).unwrap_or("".to_owned()),
                row.get(5)?,
                row.get(6)?,
            ))
        },
    )? {
        let (id, date, name, category, transaction_types, bank, amount): (
            i64,
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
            id: Some(id),
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

pub fn delete_transaction_by_id(db: &mut Connection, id: i64) -> Result<()> {
    let tx = db.transaction()?;
    tx.execute(
        "DELETE FROM 
            transaction_type_mapping 
            WHERE transaction_id = @id;",
        named_params! {
            "@id": id,
        },
    )?;
    tx.execute(
        "DELETE FROM 
            transactions 
            WHERE id = @id;",
        named_params! {
            "@id": id,
        },
    )?;

    tx.commit()
}

pub fn get_category_id(db: &Connection, category: &str) -> i64 {
    let query = format!("SELECT id FROM category WHERE name = ?");
    let mut stmt = db.prepare(&query).unwrap();
    stmt.query_row([category], |row| row.get(0)).unwrap()
}

pub fn get_bank_id(db: &Connection, bank: &str) -> i64 {
    let query = format!("SELECT id FROM bank WHERE name = ?");
    let mut stmt = db.prepare(&query).unwrap();
    stmt.query_row([bank], |row| row.get(0)).unwrap()
}

pub fn edit_transaction(db: &mut Connection, transaction: Transaction) -> Result<()> {
    let category_id = get_category_id(db, &transaction.category);
    let bank_id = get_bank_id(db, &transaction.bank);

    let tx = db.transaction()?;

    tx.execute(
        "UPDATE transactions
            SET 
                date = @date,
                name = @name,
                category_id = @category_id,
                bank_id = @bank_id,
                amount = @amount
            WHERE id = @id;",
        named_params! {
            "@id": transaction.id,
            "@date": transaction.date,
            "@name": transaction.name,
            "@category_id": category_id,
            "@bank_id": bank_id,
            "@amount": transaction.amount
        },
    )?;

    // TODO: There could be a better way to handle update,
    // this is the simplest for now
    tx.execute(
        "DELETE FROM 
            transaction_type_mapping 
            WHERE transaction_id = @transaction_id;",
        named_params! {
            "@transaction_id": transaction.id,
        },
    )?;

    if !transaction.transaction_types.is_empty() {
        let transaction_type_ids = insert_if_not_exists(
            &tx,
            "transaction_type",
            "name",
            &transaction.transaction_types,
        );

        for transaction_type_id in transaction_type_ids {
            tx.execute(
                "INSERT INTO transaction_type_mapping (transaction_id, transaction_type_id) VALUES (?, ?)",
                &[&transaction.id.unwrap(), &transaction_type_id], // this feels kinda icky but will do for now
                )?;
        }
    }

    tx.commit()
}
