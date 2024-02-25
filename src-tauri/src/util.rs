use std::path::PathBuf;

use tauri::AppHandle;

pub fn get_app_dir(app_handle: &AppHandle) -> PathBuf {
    let app_dir_base = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist.");
    if cfg!(debug_assertions) {
        // Convert to string and append suffix
        let path_str = app_dir_base.into_os_string().into_string().unwrap();
        let new_path_str = format!("{}-dev", path_str);

        // Convert back to PathBuf
        PathBuf::from(new_path_str)
    } else {
        app_dir_base
    }
}
