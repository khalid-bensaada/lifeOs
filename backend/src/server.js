import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, (err) => {
  if (err) {
    console.error(
      `Could not start the server on port ${env.port}:`,
      err.message,
    );
    process.exit(1);
  }
  console.log(`LifeOS API running on http://localhost:${env.port}`);
});
