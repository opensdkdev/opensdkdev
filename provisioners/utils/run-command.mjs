import { spawn } from "node:child_process";

export async function runCommand(command, args, options) {
  await new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      ...options,
      stdio: "inherit"
    });

    childProcess.on("error", reject);
    childProcess.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${String(code)}.`));
    });
  });
}
