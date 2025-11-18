# usb_agent.py
import time
import psutil
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import ctypes

app = FastAPI()

# Configure CORS (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

def find_usb_drive():
    """Detect the first removable USB drive."""
    for p in psutil.disk_partitions(all=False):
        if "removable" in p.opts.lower() or "flash" in p.device.lower():
            return p.mountpoint
    return None

def is_hidden(filepath: Path) -> bool:
    """Check if a file is hidden (Windows or Unix)."""
    if os.name == "nt":
        try:
            attrs = ctypes.windll.kernel32.GetFileAttributesW(str(filepath))
            if attrs == -1:
                return False
            return bool(attrs & 2)  # FILE_ATTRIBUTE_HIDDEN
        except Exception:
            return False
    else:
        return filepath.name.startswith('.')

def scan_for_wallet(drive):
    """Look for .ert files (including hidden) and return the content."""
    drive_path = Path(drive)
    for file in drive_path.rglob("*.ert"):
        try:
            if not file.is_file():
                continue
            # Read hidden or visible .ert files
            if is_hidden(file) or True:  # Include hidden files
                with open(file, "r") as f:
                    content = f.read().strip()
                    if content:
                        return content
        except:
            continue
    return None

@app.get("/wallet")
def get_wallet():
    """
    Returns wallet content if a USB drive with a .ert file is connected.
    No caching: returns False if the device is removed.
    """
    drive = find_usb_drive()
    if not drive:
        return {"found": False, "walletData": None}

    wallet_content = scan_for_wallet(drive)
    if wallet_content:
        return {"found": True, "walletData": wallet_content}

    return {"found": False, "walletData": None}

def watch_usb(interval=2):
    """
    Continuously monitors USB drives (for debugging/logging purposes).
    Prints when a wallet is found or removed.
    """
    last_drive = None
    while True:
        drive = find_usb_drive()
        if drive != last_drive:
            last_drive = drive
            if drive:
                wallet = scan_for_wallet(drive)
                if wallet:
                    print(f"[USB AGENT] Wallet detected on {drive}")
                else:
                    print(f"[USB AGENT] USB detected but no wallet found on {drive}")
            else:
                print("[USB AGENT] No USB drive detected")
        time.sleep(interval)

if __name__ == "__main__":
    import threading

    # Optional: run the watcher in background for logging
    watcher_thread = threading.Thread(target=watch_usb, daemon=True)
    watcher_thread.start()

    uvicorn.run(app, host="0.0.0.0", port=5005)
