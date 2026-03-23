import 'dotenv/config'
import { main } from "../provisioners/index.mjs";

main().catch((error) => {
  console.error(`[provision] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
