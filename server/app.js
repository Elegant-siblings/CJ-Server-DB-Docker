const express = require("express");
const mysql = require("mysql");
const app = express();

const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "test",
});

app.get("/", (req, res) => {
  connection.query("SELECT * FROM deliveryInfo", (err, rows) => {
    if (err) {
      res.json({
        success: false, 
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

app.get("/works", (req, res) => {
  deliveryDate = req.query.deliveryDate
  reciverAdd1 = req.query.reciverAdd1.map((v) => {return "'"+String(v)+"'"})
  reciverAdd2 = req.query.reciverAdd2.map((v) => {return "'"+String(v)+"'"})
  connection.query("SELECT * FROM deliveryInfo WHERE reciverAddr1 IN ("+reciverAdd1+") AND reciverAddr2 IN ("+reciverAdd2+")", (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});


app.get("/test", (req, res) => {
  res.json({
    0: ["35.46650", "129.24949"],
    1: ["35.47768", "129.09151"],
    2: ["35.36360", "129.10525"],
    3: ["35.33226", "128.97749"],
    4: ["35.22133", "128.86073"],
  });
});


app.listen(3000, () => console.log("listining on port 3000"));