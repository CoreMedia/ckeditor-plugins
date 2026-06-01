import path from "path";
import express from "express";

const app = express();
const applicationFolder = path.resolve("../../app");
app.use("/", express.static(applicationFolder));

const port = process.env.APPLICATION_PORT ?? "12345";

await new Promise((resolve) => {
  const server = app.listen(port, () => {
    console.log("server started", server.address());
    resolve(server);
  });
});
