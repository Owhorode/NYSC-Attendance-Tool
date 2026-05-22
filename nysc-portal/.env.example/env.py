"""
Run this script ONCE from the root of your project to generate
your .env file interactively. It will ask for each value one at a time,
validate it, and write the final file safely.

"""

import os
import sys
import textwrap

# ── Configuration ─────────────────────────────────────────────────────────
# If you want to force the .env file to save to a specific folder every time,
# change this path (e.g., "C:/Users/Name/Documents/nysc-portal").
# Leave it as "" to default to the folder where this script is currently located.
CUSTOM_SAVE_DIRECTORY = ""

# ── Colour helpers (works on Windows 10+ and all Unix terminals) ──────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def ok(msg):    print(f"{GREEN}  ✔  {msg}{RESET}")
def warn(msg):  print(f"{YELLOW}  ⚠  {msg}{RESET}")
def err(msg):   print(f"{RED}  ✖  {msg}{RESET}")
def title(msg): print(f"\n{BOLD}{CYAN}{msg}{RESET}")

def ask(prompt, default="", secret=False):
    """
    Prompt the user for a value.
    - Shows [default] if one exists.
    - Strips whitespace automatically.
    - Keeps asking until a non-empty value is provided (or default is used).
    """
    hint = f" [{default}]" if default else ""
    while True:
        raw = input(f"  {BOLD}{prompt}{hint}:{RESET} ").strip()
        value = raw if raw else default
        if value:
            return value
        err("This field is required. Please enter a value.")

# ── Questions ─────────────────────────────────────────────────────────────

QUESTIONS = [
    # (env_key, prompt_text, default_value, section_title)
    
    # Firebase
    ("VITE_FIREBASE_API_KEY",             "Firebase API Key",              "",                          "FIREBASE CONFIGURATION"),
    ("VITE_FIREBASE_AUTH_DOMAIN",         "Firebase Auth Domain",          "",                          None),
    ("VITE_FIREBASE_PROJECT_ID",          "Firebase Project ID",           "",                          None),
    ("VITE_FIREBASE_STORAGE_BUCKET",      "Firebase Storage Bucket",       "",                          None),
    ("VITE_FIREBASE_MESSAGING_SENDER_ID", "Firebase Messaging Sender ID",  "",                          None),
    ("VITE_FIREBASE_APP_ID",              "Firebase App ID",               "",                          None),
    ("VITE_FIREBASE_MEASUREMENT_ID",      "Firebase Measurement ID",       "",                          None),

    # Master Keys
    ("VITE_MASTER_KEY_LGI",               "LGI Master Key (make it strong)", "LGI-2026-8842",           "ADMIN MASTER KEYS"),
    ("VITE_MASTER_KEY_SUPER_ADMIN",       "Super Admin Master Key",          "SUP-2026-9953",           None),
    ("VITE_SUPER_ADMIN_EMAIL",            "Super Admin Email",               "superadmin@nysc.portal",  None),
    ("VITE_LGI_EMAIL",                    "LGI Official Email",              "lgi@nysc.portal",         None),
    ("VITE_LEGACY_PASSWORD",              "Legacy Migration Password",       "owhorode2025+1",          None),

    # Geofence
    ("VITE_GEOFENCE_LAT",                 "CDS Venue Latitude",             "6.4634390",                "GEOFENCE (GPS) SETTINGS"),
    ("VITE_GEOFENCE_LNG",                 "CDS Venue Longitude",            "3.3928134",                None),
    ("VITE_GEOFENCE_RADIUS_METERS",       "Geofence Radius (metres)",       "150",                      None),

    # Branding
    ("VITE_APP_LGA_NAME",                 "Your LGA Name",                  "Lagos Island",             "APPLICATION BRANDING"),
    ("VITE_APP_STATE_NAME",               "Your State Name",                "Lagos",                    None),
]

def validate_firebase_key(key, value):
    """Light sanity checks on specific keys."""
    if key == "VITE_FIREBASE_API_KEY" and not value.startswith("AIza"):
        warn("Firebase API keys normally start with 'AIza'. Double-check this value.")
    if key == "VITE_FIREBASE_AUTH_DOMAIN" and ".firebaseapp.com" not in value:
        warn("Auth domain should look like: your-project-id.firebaseapp.com")
    if key == "VITE_FIREBASE_APP_ID" and not value.startswith("1:"):
        warn("App ID should look like: 1:123456789:web:abcdef")
    if key in ("VITE_GEOFENCE_LAT", "VITE_GEOFENCE_LNG"):
        try:
            float(value)
        except ValueError:
            err(f"{key} must be a number (e.g. 6.4634390). Please re-run.")
            sys.exit(1)
    if key == "VITE_GEOFENCE_RADIUS_METERS":
        try:
            int(value)
        except ValueError:
            err("Radius must be a whole number (e.g. 150). Please re-run.")
            sys.exit(1)

def main():
    print(f"\n{BOLD}{'─'*60}{RESET}")
    print(f"{BOLD}  NYSC Portal — .env File Generator{RESET}")
    print(f"{BOLD}{'─'*60}{RESET}")
    print(textwrap.dedent("""
      This script will ask for your Firebase credentials and other
      settings, then write a correctly formatted .env file.

      ► Find Firebase values at:
        console.firebase.google.com → Project Settings → Your apps → Config

      ► Press ENTER to accept the [default] value shown in brackets.
      ► Defaults are safe placeholders — replace Firebase values with REAL ones.
    """))

    # ── Determine Save Directory ──────────────────────────────────────────────
    if CUSTOM_SAVE_DIRECTORY:
        target_dir = CUSTOM_SAVE_DIRECTORY
    else:
        target_dir = os.path.dirname(os.path.abspath(__file__))

    title("OUTPUT DESTINATION")
    print(f"  The .env file is currently set to be saved here:")
    print(f"  {CYAN}{target_dir}{RESET}\n")
    
    user_dir = input(f"  {BOLD}Press ENTER to confirm, or type a new folder path:{RESET} ").strip()
    if user_dir:
        target_dir = user_dir

    # Create the directory if it doesn't exist
    os.makedirs(target_dir, exist_ok=True)
    env_path = os.path.join(target_dir, ".env")

    # ── Safety check: warn if .env already exists ─────────────────────────
    if os.path.exists(env_path):
        warn(f".env already exists in {target_dir}!")
        confirm = input(f"  {BOLD}Overwrite it? (yes/no):{RESET} ").strip().lower()
        if confirm not in ("yes", "y"):
            print("  Aborted. Your existing .env was not changed.")
            sys.exit(0)

    # ── Collect values ─────────────────────────────────────────────────────
    collected = {}
    for key, prompt, default, section in QUESTIONS:
        if section:
            title(section)
        value = ask(prompt, default)
        validate_firebase_key(key, value)
        collected[key] = value

    # ── Build the file content ─────────────────────────────────────────────
    lines = [
        "# =============================================================================",
        "# NYSC Attendance & Clearance Portal — Environment Variables",
        "# Generated by create_env.py",
        "# DO NOT COMMIT THIS FILE TO GIT",
        "# =============================================================================",
        "",
        "# --- FIREBASE CONFIGURATION ---",
        f'VITE_FIREBASE_API_KEY={collected["VITE_FIREBASE_API_KEY"]}',
        f'VITE_FIREBASE_AUTH_DOMAIN={collected["VITE_FIREBASE_AUTH_DOMAIN"]}',
        f'VITE_FIREBASE_PROJECT_ID={collected["VITE_FIREBASE_PROJECT_ID"]}',
        f'VITE_FIREBASE_STORAGE_BUCKET={collected["VITE_FIREBASE_STORAGE_BUCKET"]}',
        f'VITE_FIREBASE_MESSAGING_SENDER_ID={collected["VITE_FIREBASE_MESSAGING_SENDER_ID"]}',
        f'VITE_FIREBASE_APP_ID={collected["VITE_FIREBASE_APP_ID"]}',
        f'VITE_FIREBASE_MEASUREMENT_ID={collected["VITE_FIREBASE_MEASUREMENT_ID"]}',
        "",
        "# --- ADMIN MASTER KEYS ---",
        f'VITE_MASTER_KEY_LGI={collected["VITE_MASTER_KEY_LGI"]}',
        f'VITE_MASTER_KEY_SUPER_ADMIN={collected["VITE_MASTER_KEY_SUPER_ADMIN"]}',
        f'VITE_SUPER_ADMIN_EMAIL={collected["VITE_SUPER_ADMIN_EMAIL"]}',
        f'VITE_LGI_EMAIL={collected["VITE_LGI_EMAIL"]}',
        f'VITE_LEGACY_PASSWORD={collected["VITE_LEGACY_PASSWORD"]}',
        "",
        "# --- GEOFENCE CONFIGURATION ---",
        f'VITE_GEOFENCE_LAT={collected["VITE_GEOFENCE_LAT"]}',
        f'VITE_GEOFENCE_LNG={collected["VITE_GEOFENCE_LNG"]}',
        f'VITE_GEOFENCE_RADIUS_METERS={collected["VITE_GEOFENCE_RADIUS_METERS"]}',
        "",
        "# --- APPLICATION METADATA ---",
        f'VITE_APP_LGA_NAME="{collected["VITE_APP_LGA_NAME"]}"',
        f'VITE_APP_STATE_NAME="{collected["VITE_APP_STATE_NAME"]}"',
    ]

    file_content = "\n".join(lines) + "\n"

    # ── Write the file ─────────────────────────────────────────────────────
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(file_content)

    # ── Success summary ────────────────────────────────────────────────────
    print(f"\n{'─'*60}")
    ok(f".env successfully written to:  {env_path}")
    print()
    print("  Next steps:")
    print(f"  {CYAN}1.{RESET} npm install")
    print(f"  {CYAN}2.{RESET} npm run dev        ← local browser preview")
    print(f"  {CYAN}3.{RESET} npm run build      ← production bundle")
    print(f"  {CYAN}4.{RESET} firebase deploy      ← push to Firebase Hosting")
    print()
    warn("Never commit .env to Git. Ensure it is in your .gitignore.")
    print(f"{'─'*60}\n")


if __name__ == "__main__":
    main()