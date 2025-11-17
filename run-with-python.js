const { spawn } = require("child_process");

console.log("Starting USB agent (python ./usb/usb_agent.py)...");

const python = spawn("python", ["./usb/usb_agent.py"], {
  stdio: "inherit",
});

// Restart python agent if it crashes
python.on("close", (code) => {
  console.log(`USB agent exited with code ${code}`);
});
