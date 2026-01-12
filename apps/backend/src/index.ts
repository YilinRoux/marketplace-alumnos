import express from "express";

const app = express();
app.get("/", (_, res) => res.send("Backend OK"));

app.listen(4000, () => console.log("Backend running on 4000"));
