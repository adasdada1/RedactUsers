import { MongoClient } from "mongodb";
import express from "express";
import { router } from "./routes/index.mjs";

const app = express();
const client = new MongoClient("mongodb://127.0.0.1:27017/");

(async () => {
  try {
    await client.connect();
    app.locals.collection = client.db("mongo").collection("users");
    app.listen(3000, () => console.log("Сервер запущен"));
  } catch (err) {
    return console.log(err);
  }
})();

app.use(express.static("public"));
app.use(express.json());
app.use(router);

process.on("SIGINT", async () => {
  await client.close();
  console.log("Приложение завершило работу");
  process.exit();
});
