# usb_agent.py
import time
import psutil
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_headers=["*"],
    allow_methods=["*"],
)

def find_usb_drive():
    """Detect removable drives."""
    for p in psutil.disk_partitions(all=False):
        if "removable" in p.opts or "flash" in p.device.lower():
            return p.mountpoint
    return None

def scan_for_wallet(drive):
    """Look for .ert wallet files and return their raw content."""
    drive_path = Path(drive)
    for file in drive_path.rglob("*.ert"):
        try:
            with open(file, "r") as f:
                content = f.read().strip()
                if content:
                    return content
        except:
            continue
    return None

@app.get("/wallet")
def get_wallet():
    """Return wallet content if found on connected USB."""
    drive = find_usb_drive()
    if not drive:
        return {"found": False, "walletData": None}

    wallet_content = scan_for_wallet(drive)
    if wallet_content:
        return {"found": True, "walletData": wallet_content}

    return {"found": False, "walletData": None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5005)
