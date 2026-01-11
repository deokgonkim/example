use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

const PORTAL_DEST: &str = "org.freedesktop.portal.Desktop";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const PORTAL_IFACE: &str = "org.freedesktop.portal.Inhibit";
const INHIBIT_IDLE: &str = "8";

fn build_gdbus_args(app_id: &str, reason: &str) -> Vec<String> {
    let escaped = reason.replace('\'', "\\'");
    let options = format!("{{'reason': <'{}'>}}", escaped);
    vec![
        "call".into(),
        "--session".into(),
        "--dest".into(),
        PORTAL_DEST.into(),
        "--object-path".into(),
        PORTAL_PATH.into(),
        "--method".into(),
        format!("{}.Inhibit", PORTAL_IFACE),
        app_id.into(),
        "".into(),
        INHIBIT_IDLE.into(),
        options,
    ]
}

fn main() {
    let mut app_id = "com.example.nosleep".to_string();
    let mut reason = "Keeping the session awake".to_string();

    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--app-id" => {
                if let Some(val) = args.next() {
                    app_id = val;
                }
            }
            "--reason" => {
                if let Some(val) = args.next() {
                    reason = val;
                }
            }
            "-h" | "--help" => {
                println!("Usage: nosleep [--app-id ID] [--reason TEXT]");
                return;
            }
            _ => {}
        }
    }

    let gdbus_args = build_gdbus_args(&app_id, &reason);
    let output = Command::new("gdbus")
        .args(&gdbus_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output();

    let output = match output {
        Ok(out) => out,
        Err(err) => {
            if err.kind() == std::io::ErrorKind::NotFound {
                eprintln!("gdbus not found. Install the 'glib2.0-bin' package.");
            } else {
                eprintln!("Failed to run gdbus: {err}");
            }
            std::process::exit(1);
        }
    };

    if !output.status.success() {
        eprintln!("Failed to request inhibit via xdg-desktop-portal.");
        if !output.stderr.is_empty() {
            eprintln!("{}", String::from_utf8_lossy(&output.stderr).trim());
        }
        std::process::exit(output.status.code().unwrap_or(1));
    }

    let handle = String::from_utf8_lossy(&output.stdout).trim().to_string();
    println!("Inhibit active. Press Ctrl+C to release.");
    if !handle.is_empty() {
        println!("Portal handle: {handle}");
    }

    loop {
        thread::sleep(Duration::from_secs(60));
    }
}
