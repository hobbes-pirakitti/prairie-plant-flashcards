const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const jsonDataFileName = "data.json";
const imagesFolder = "images";

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/data", (req, res) => {
    const jsonFilePath = path.join(process.cwd(), jsonDataFileName);
    res.sendFile(jsonFilePath);
});

app.get("/image/:imageName", (req, res) => {
    const iamgeFilePath = path.join(process.cwd(), imagesFolder, req.params.imageName);
    res.sendFile(iamgeFilePath);
});

app.listen(port, () => {
    console.log("Running.");
})