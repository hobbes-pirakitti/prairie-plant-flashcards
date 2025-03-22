const port = 3000;
const jsonDataFileName = "data.json";
const imagesFolder = "images";

const express = require("express");
const path = require("path");
const cors = require('cors')
const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

app.use(cors(corsOptions));
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