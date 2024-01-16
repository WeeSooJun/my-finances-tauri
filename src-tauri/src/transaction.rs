use chrono::NaiveDate;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

// struct MyNaiveDate(NaiveDate);

// impl FromSql for MyNaiveDate {
//     fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
//         match value {
//             ValueRef::Text(s) => NaiveDate::parse_from_str(&s, "%Y-%m-%d")
//                 .map_err(|e| rusqlite::types::FromSqlError::Other(Box::new(e))),
//             _ => Err(rusqlite::types::FromSqlError::InvalidType),
//         }
//     }
// }

// impl ToSql for MyNaiveDate {
//     fn to_sql(&self) -> rusqlite::Result<ToSqlOutput> {
//         Ok(ToSqlOutput::from(self.0.format("%Y-%m-%d").to_string()))
//     }
// }

fn serialize_date<S>(date: &NaiveDate, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&date.format("%Y-%m-%d").to_string())
}

fn deserialize_date<'de, D>(deserializer: D) -> Result<NaiveDate, D::Error>
where
    D: Deserializer<'de>,
{
    let date_str = String::deserialize(deserializer)?;

    NaiveDate::parse_from_str(&date_str, "%Y-%m-%d").map_err(serde::de::Error::custom)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    #[serde(
        serialize_with = "serialize_date",
        deserialize_with = "deserialize_date"
    )]
    pub date: NaiveDate,
    pub name: String,
    pub transaction_type: String,
    pub bank: String,
    pub amount: f64,
}
