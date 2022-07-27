const express = require("express");
const mysql = require("mysql");
const { INTEGER } = require("sequelize");
const app = express();

const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "test",
});



app.get("/deliveryInfo", (req, res) => {
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

app.get("/workInfo", (req, res) => {
  connection.query("SELECT * FROM workInfo", (err, rows) => {
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

app.get("/workItem", (req, res) => {
  connection.query("SELECT * FROM workItem", (err, rows) => {
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

function receiverConvert(address){
  if(typeof(address) == "string"){
    address = ["'"+String(address)+"'"]
    return address
  }
  else{
    return address.map((v) => {return "'"+String(v)+"'"})
  }
}

app.get("/works", (req, res) => {
  deliveryDate = req.query.deliveryDate
  receiverAdd1 = "'"+req.query.receiverAdd1.split(',').join("','")+"'"
  receiverAdd2 = "'"+req.query.receiverAdd2.split(',').join("','")+"'"

  console.log(receiverAdd1)
  console.log(receiverAdd2)
  // receiverAdd1 = receiverConvert(req.query.receiverAdd1)
  // receiverAdd2 = receiverConvert(req.query.receiverAdd2)

  connection.query("SELECT * FROM deliveryInfo WHERE deliveryDate="+deliveryDate+" AND receiverAddr1 IN ("+receiverAdd1+") AND receiverAddr2 IN ("+receiverAdd2+") LIMIT 100", (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      // console.log(rows)
      rows = rows.map((v) => { return {
        deliveryPK: v['deliveryPK'],
        itemCategory: v['itemCategory'],
        receiverAddr: [v['receiverAddr1'],v['receiverAddr2'],v['receiverAddr3']].join(' ')
      }})
      res.json({
        success: true,
        rows: [ rows ] ,
      });
    }
  });
});

String.format = function() {
	let args = arguments;

	return args[0].replace(/{(\d+)}/g, function(match, num) {
		num = Number(num) + 1;
		return typeof(args[num]) != undefined ? args[num] : match;
    });
}

function SQLString(x){
  return "'"+String(x)+"'"
}

app.get("/works/register", (req, res) => {
  deliveryPK = req.query.deliveryPK.split(",").map((v) => {return Number(v)})
  deliveryManID = "'"+String(req.query.deliveryManID)+"'"
  deliveryDate = "'"+String(req.query.deliveryDate)+"'"
  deliveryType = req.query.deliveryType
  deliveryTime = req.query.deliveryTime
  deliveryCar = "'"+String(req.query.deliveryCar)+"'"
  terminalAddr = "'"+String(req.query.terminalAddr)+"'"

  workPK = -1
  connection.query(String.format("INSERT INTO workInfo VALUES (NULL, {0}, {1}, {2}, {3}, {4}, {5})",
    deliveryManID,deliveryDate,deliveryType,deliveryTime,deliveryCar,terminalAddr), (err, rows) => {
    if (err) {
      throw err
    }
    console.log("1 recored inserted workInfo table")
    connection.query("SELECT MAX(workPK) FROM workInfo", (err, rows) => {
      if (err) {
        throw err
      }
      workPK = rows[0]['MAX(workPK)']
    });
    deliveryPK.map((v) => {
      connection.query(String.format("SELECT * FROM deliveryInfo WHERE deliveryPK={0}", v), (err, row) => {
          row = row[0]
          connection.query(String.format("INSERT INTO workItem VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, 0)",
          v, workPK, SQLString(row['sender']), SQLString(row['receiver']), SQLString(row['itemCategory']), SQLString(row['senderAddr1']), SQLString(row['senderAddr2']), SQLString(row['senderAddr3']), SQLString(row['receiverAddr1']), SQLString(row['receiverAddr2']), SQLString(row['receiverAddr3'])), (err, ans) => {
            if(err) {
              throw err
            }
          })
        })
      });
      console.log(String(deliveryPK.length)+" recored inserted workItem table")
  });
});

app.get("/works/check", (req, res) => {
  deliveryManID = req.query.deliveryManID
  type = ['일반 배송', '집화 / 반품']
  time = ['주간', '새벽']
  terminalAddress = {'서울' : '서울 서초구 4번길 14-2길'}
  connection.query(String.format("SELECT * FROM workInfo WHERE deliveryManID={0}", deliveryManID), (err, rows) => {
    if(err){
      throw err
    }
    rows = rows.map((v) => { return {
      workPK: v['workPK'],
      deliveryDate: v['deliveryDate'],
      deliveryType: type[v['deliveryType']],
      deliveryTime: time[v['deliveryTime']],
      deliveryCar: v['deliveryCar'],
      terminalAddr: terminalAddress[v['terminalAddr']],
    }})
    res.json({
      rows: [rows]
    })
  })
});

app.get("/works/itemlist", (req, res) => {
  workPK = req.query.workPK
  connection.query(String.format("SELECT * FROM workItem WHERE workPK={0}", workPK), (err, rows) => {
    if(err){
      throw err
    }
    rows = rows.map((v) => { return {
      deliveryPK: v['deliveryPK'],
      sender: v['sender'],
      receiver: v['receiver'],
      itemCategory: v['itemCategory'],
      senderAddr: [v['senderAddr1'],v['senderAddr2'],v['senderAddr3']].join(' '),
      receiverAddr: [v['receiverAddr1'],v['receiverAddr2'],v['receiverAddr3']].join(' ')
    }})
    res.json({
      rows: [rows]
    })
  })
});

app.get("/test", (req, res) => {
  res.json({
    start: ["35.46650", "129.24949"],
    waypoint : [
      ["35.47768", "129.09151"],
      ["35.36360", "129.10525"],
      ["35.33226", "128.97749"],
    ],
    finish: ["35.22133", "128.86073"],
  });
});


app.listen(3000, () => console.log("listining on port 3000"));