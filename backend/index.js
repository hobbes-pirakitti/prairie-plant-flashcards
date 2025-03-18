const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const jsonDataFileName = "data.json";

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/data", (req, res) => {
    const jsonFilePath = path.join(process.cwd(), jsonDataFileName);
    res.sendFile(jsonFilePath);
});

app.listen(port, () => {
    console.log("Running.");
})