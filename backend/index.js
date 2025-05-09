const port = 3000;
const plantsJsonDataFileName = "plants.json";
const imagesJsonDataFileName = "images.json";
const imagesFolder = "images";

const express = require("express");
const path = require("path");
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();

const corsOptions = {
    origin: (origin, callback) => { 
        callback(null, true); 
    }, 
    credentials: true,
  }; 
app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/favicon.ico", (req, res) => {
    const jsonFilePath = path.join(process.cwd(), "favicon.ico");
    res.sendFile(jsonFilePath);
});

app.get("/plants", (req, res) => {
    const jsonFilePath = path.join(process.cwd(), plantsJsonDataFileName);
    res.sendFile(jsonFilePath);
});

app.get("/images", (req, res) => {
    const jsonFilePath = path.join(process.cwd(), imagesJsonDataFileName);
    res.sendFile(jsonFilePath);
});

app.get("/image/:imageName", (req, res) => {
    const iamgeFilePath = path.join(process.cwd(), imagesFolder, req.params.imageName);
    res.sendFile(iamgeFilePath);
});

/*
app.listen(port, '0.0.0.0', () => {
    console.log("Running.");
}); */

const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

const server = https.createServer(httpsOptions, app).listen(port, "0.0.0.0", () => {
    console.log("Running.");
})