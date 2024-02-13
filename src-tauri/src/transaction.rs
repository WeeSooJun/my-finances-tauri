use chrono::NaiveDate;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

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

    // // Try parsing the date with the first format ("%d/%m/%Y")
    // if let Ok(parsed_date) = NaiveDate::parse_from_str(&date_str, "%d/%m/%Y") {
    //     return Ok(parsed_date);
    // }

    // // Try parsing the date with the second format ("%Y-%m-%d")
    // if let Ok(parsed_date) = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d") {
    //     return Ok(parsed_date);
    // }

    NaiveDate::parse_from_str(&date_str, "%Y-%m-%d").map_err(serde::de::Error::custom)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Option<i64>, // This feels a bit out of place and could be 2 structs, but let's leave it for now and continue on
    #[serde(
        serialize_with = "serialize_date",
        deserialize_with = "deserialize_date"
    )]
    pub date: NaiveDate,
    pub name: String,
    pub category: String,
    pub transaction_types: Vec<String>,
    pub bank: String,
    pub amount: f64,
}
