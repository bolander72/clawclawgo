use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

fn home_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("/tmp"))
}

fn openclaw_dir() -> PathBuf {
    home_dir().join(".openclaw")
}

fn workspace_dir() -> PathBuf {
    openclaw_dir().join("workspace")
}

// ─── Config reader ───

#[tauri::command]
fn get_config() -> Result<Value, String> {
    let path = openclaw_dir().join("openclaw.json");
    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))
}

// ─── Workspace file reader ───

#[tauri::command]
fn read_workspace_file(filename: String) -> Result<String, String> {
    let path = workspace_dir().join(&filename);
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", filename, e))
}

// ─── Skills discovery ───

#[derive(Serialize, Clone)]
struct SkillInfo {
    name: String,
    source: String, // "bundled", "custom", "community"
    description: Option<String>,
    path: String,
}

#[tauri::command]
fn get_skills() -> Vec<SkillInfo> {
    let mut skills = Vec::new();

    // Bundled skills (npm package)
    let bundled_dir = PathBuf::from("/opt/homebrew/lib/node_modules/openclaw/skills");
    if bundled_dir.exists() {
        collect_skills(&bundled_dir, "bundled", &mut skills);
    }

    // Custom skills (workspace)
    let custom_dir = workspace_dir().join("skills");
    if custom_dir.exists() {
        collect_skills(&custom_dir, "custom", &mut skills);
    }

    skills
}

fn collect_skills(dir: &PathBuf, source: &str, skills: &mut Vec<SkillInfo>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let skill_md = path.join("SKILL.md");
                let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                // Skip hidden dirs
                if name.starts_with('.') {
                    continue;
                }
                let description = if skill_md.exists() {
                    fs::read_to_string(&skill_md)
                        .ok()
                        .and_then(|content| {
                            // Extract description from first non-heading, non-empty line
                            content.lines()
                                .find(|l| !l.starts_with('#') && !l.trim().is_empty())
                                .map(|s| s.trim().to_string())
                        })
                } else {
                    None
                };
                skills.push(SkillInfo {
                    name,
                    source: source.to_string(),
                    description,
                    path: path.to_string_lossy().to_string(),
                });
            }
        }
    }
}

// ─── System status (via openclaw CLI) ───

#[derive(Serialize)]
struct SystemStatus {
    gateway: String, // "running" | "stopped" | "unknown"
    version: Option<String>,
    uptime: Option<String>,
    model: Option<String>,
    os: String,
    arch: String,
}

#[tauri::command]
fn get_system_status() -> SystemStatus {
    let output = Command::new("openclaw")
        .arg("status")
        .output();

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let gateway = if stdout.contains("running") || stdout.contains("✓") {
                "running".to_string()
            } else {
                "stopped".to_string()
            };
            SystemStatus {
                gateway,
                version: extract_field(&stdout, "version"),
                uptime: extract_field(&stdout, "uptime"),
                model: extract_field(&stdout, "model"),
                os: std::env::consts::OS.to_string(),
                arch: std::env::consts::ARCH.to_string(),
            }
        }
        Err(_) => SystemStatus {
            gateway: "unknown".to_string(),
            version: None,
            uptime: None,
            model: None,
            os: std::env::consts::OS.to_string(),
            arch: std::env::consts::ARCH.to_string(),
        },
    }
}

fn extract_field(text: &str, field: &str) -> Option<String> {
    text.lines()
        .find(|l| l.to_lowercase().contains(field))
        .map(|l| {
            l.split(':').skip(1).collect::<Vec<_>>().join(":").trim().to_string()
        })
        .filter(|s| !s.is_empty())
}

// ─── Cron jobs (read from gateway API) ───

#[derive(Serialize, Deserialize, Clone)]
struct CronJob {
    id: String,
    name: Option<String>,
    enabled: bool,
    #[serde(default)]
    state: Value,
    schedule: Value,
}

#[tauri::command]
fn get_cron_jobs() -> Result<Vec<CronJob>, String> {
    let output = Command::new("openclaw")
        .args(["cron", "list", "--json"])
        .output()
        .map_err(|e| format!("Failed to run openclaw: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    // Try to parse as JSON array
    let jobs: Vec<CronJob> = serde_json::from_str(&stdout)
        .or_else(|_| {
            // Maybe it's wrapped in { "jobs": [...] }
            let wrapper: Value = serde_json::from_str(&stdout)?;
            serde_json::from_value(wrapper["jobs"].clone())
        })
        .unwrap_or_default();

    Ok(jobs)
}

// ─── Slot builder from real config ───

#[derive(Serialize, Clone)]
struct SlotData {
    id: String,
    label: String,
    icon: String,
    status: String,
    component: String,
    version: Option<String>,
    details: Value,
}

#[tauri::command]
fn get_slots() -> Vec<SlotData> {
    let config = get_config().unwrap_or(Value::Null);
    let mut slots = Vec::new();

    // Soul
    let soul_exists = workspace_dir().join("SOUL.md").exists();
    let identity_name = fs::read_to_string(workspace_dir().join("IDENTITY.md"))
        .ok()
        .and_then(|c| {
            c.lines()
                .find(|l| l.contains("**Name:**"))
                .map(|l| l.split("**Name:**").nth(1).unwrap_or("").trim().to_string())
        })
        .unwrap_or_else(|| "Unknown".to_string());

    slots.push(SlotData {
        id: "soul".to_string(),
        label: "Soul".to_string(),
        icon: "◈".to_string(),
        status: if soul_exists { "active" } else { "empty" }.to_string(),
        component: "SOUL.md".to_string(),
        version: None,
        details: serde_json::json!({ "name": identity_name, "file": "SOUL.md" }),
    });

    // Skeleton (primary model)
    let model = config.pointer("/model/default")
        .or(config.pointer("/model"))
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();
    let subagent_model = config.pointer("/model/subagent")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();

    slots.push(SlotData {
        id: "skeleton".to_string(),
        label: "Skeleton".to_string(),
        icon: "⬢".to_string(),
        status: "active".to_string(),
        component: model.clone(),
        version: None,
        details: serde_json::json!({
            "primary": model,
            "subagent": subagent_model,
        }),
    });

    // Heart (heartbeat)
    let heartbeat_exists = workspace_dir().join("HEARTBEAT.md").exists();
    let hb_content = fs::read_to_string(workspace_dir().join("HEARTBEAT.md")).unwrap_or_default();
    let hb_tasks = hb_content.lines()
        .filter(|l| l.starts_with("- "))
        .count();

    slots.push(SlotData {
        id: "heart".to_string(),
        label: "Heart".to_string(),
        icon: "♥".to_string(),
        status: if heartbeat_exists && hb_tasks > 0 { "active" } else { "empty" }.to_string(),
        component: "Heartbeat Engine".to_string(),
        version: None,
        details: serde_json::json!({ "tasks": hb_tasks }),
    });

    // Brain (LCM)
    let lcm_config = &config["lcm"];
    let lcm_engine = lcm_config.get("engine")
        .and_then(|v| v.as_str())
        .unwrap_or("lossless-claw");

    slots.push(SlotData {
        id: "brain".to_string(),
        label: "Brain".to_string(),
        icon: "⧫".to_string(),
        status: "active".to_string(),
        component: "LosslessClaw".to_string(),
        version: None,
        details: serde_json::json!({
            "engine": lcm_engine,
        }),
    });

    // OS
    let oc_version = Command::new("openclaw")
        .arg("--version")
        .output()
        .ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .filter(|s| !s.is_empty());

    slots.push(SlotData {
        id: "os".to_string(),
        label: "OS".to_string(),
        icon: "⬡".to_string(),
        status: "active".to_string(),
        component: "OpenClaw".to_string(),
        version: oc_version,
        details: serde_json::json!({
            "platform": format!("{} {}", std::env::consts::OS, std::env::consts::ARCH),
        }),
    });

    // Nervous System (channels)
    let channels = &config["channels"];
    let channel_names: Vec<String> = if let Some(obj) = channels.as_object() {
        obj.keys().cloned().collect()
    } else {
        vec![]
    };

    slots.push(SlotData {
        id: "nervousSystem".to_string(),
        label: "Nervous System".to_string(),
        icon: "⚡".to_string(),
        status: if channel_names.is_empty() { "empty" } else { "active" }.to_string(),
        component: channel_names.first().cloned().unwrap_or("None".to_string()),
        version: None,
        details: serde_json::json!({ "channels": channel_names }),
    });

    // Mouth (TTS)
    let tts = &config["tts"];
    let tts_provider = tts.get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("none");

    slots.push(SlotData {
        id: "mouth".to_string(),
        label: "Mouth".to_string(),
        icon: "◐".to_string(),
        status: if tts_provider != "none" { "active" } else { "empty" }.to_string(),
        component: tts_provider.to_string(),
        version: None,
        details: serde_json::json!({
            "provider": tts_provider,
        }),
    });

    // Eyes (cameras/screen)
    let has_cameras = config.pointer("/homeAssistant").is_some()
        || config.pointer("/camera").is_some();

    slots.push(SlotData {
        id: "eyes".to_string(),
        label: "Eyes".to_string(),
        icon: "◉".to_string(),
        status: if has_cameras { "active" } else { "empty" }.to_string(),
        component: "Vision".to_string(),
        version: None,
        details: serde_json::json!({}),
    });

    // Ears (STT)
    slots.push(SlotData {
        id: "ears".to_string(),
        label: "Ears".to_string(),
        icon: "◑".to_string(),
        status: "active".to_string(),
        component: "Whisper".to_string(),
        version: None,
        details: serde_json::json!({ "engine": "local" }),
    });

    slots
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_config,
            read_workspace_file,
            get_skills,
            get_system_status,
            get_cron_jobs,
            get_slots,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
