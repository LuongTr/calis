import { env } from "./config.js";
import { app } from "./app.js";

app.listen(env.PORT, () => {
  console.log(`Calis backend API listening on port ${env.PORT}`);
});
