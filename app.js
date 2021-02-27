// const { worker } = require('cluster');
const express = require('express');
const app = express();
const fs = require("fs");
const multer = require('multer');
const { createWorker } = require('tesseract.js');


const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, "./uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname)
    }

});

const upload = multer({storage: storage}).single("avatar");
app.set("view engine", "ejs");

// app.get('/uploads',(req,res) => {
//     console.log('hey')
// })


// ROUTES

app.get('/', (req,res) => {
    res.render('index');
});

const worker = createWorker({
    logger: m => console.log(m), // Add logger here
  });

app.post("/upload", (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) =>{
            if(err) return console.log('This is your error', err);
            (async () => {
                await worker.load();
                await worker.loadLanguage('eng+jpn');
                await worker.initialize('eng+jpn');
                const { data: { text } } = await worker.recognize(data);
                console.log(text);
                // res.send(text)
                await worker.terminate();
              })();
            
        });
    });
});

// start server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey I an on PORT ${PORT}`));     //  '' , "" , `` are different~
