const express = require("express");
const mysql = require("mysql");
const nodeGeocoder = require('node-geocoder');
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

app.get("/item", (req, res) => {
  connection.query("SELECT * FROM itemDetail", (err, rows) => {
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
  receiverAdd1 = "'"+req.query.receiverAdd1.split(',').join("','")+"'"
  receiverAdd2 = "'"+req.query.receiverAdd2.split(',').join("','")+"'"

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
        rows: rows,
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
  connection.query(String.format("SELECT COUNT(*) FROM workInfo WHERE workPK={0}", workPK), (err, rows) => {
    if(rows != 0){
        connection.query(String.format("INSERT INTO workInfo VALUES (NULL, {0}, {1}, {2}, {3}, {4}, {5})",
        deliveryManID,deliveryDate,deliveryType,deliveryTime,deliveryCar,terminalAddr), (err, rows) => {
        if (err) {
          res.json({
            success: false, 
            err,
          });
        }
        console.log("1 recored inserted workInfo table")
        connection.query("SELECT MAX(workPK) FROM workInfo", (err, rows) => {
          if (err) {
            
          }
          workPK = rows[0]['MAX(workPK)']
        });
        deliveryPK.map((v) => {
          console.log(String.format("INSERT INTO itemDetail VALUES ({0},{1},{2},{3},{4},{5})", v, "'개가뭅니다'", "NULL", "NULL", "NULL", "NULL"))
          connection.query(String.format("SELECT COUNT(*) FROM itemDetail WHERE deliveryPK={0}", v), (err, rows) => {
            if(rows != 0){
              connection.query(String.format("INSERT INTO itemDetail VALUES ({0},{1},{2},{3},{4},{5})", v, "'개가뭅니다'", "NULL", "NULL", "NULL", "NULL"), (err, row) => {})
              
              connection.query(String.format("SELECT * FROM deliveryInfo WHERE deliveryPK={0}", v), (err, row) => {
                row = row[0]
                connection.query(String.format("INSERT INTO workItem VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, 0)",
                v, workPK, SQLString(row['sender']), SQLString(row['receiver']), SQLString(row['itemCategory']), SQLString(row['senderAddr1']), SQLString(row['senderAddr2']), SQLString(row['senderAddr3']), SQLString(row['receiverAddr1']), SQLString(row['receiverAddr2']), SQLString(row['receiverAddr3'])), (err, ans) => {
                  if(err) {
                    res.json({
                      success: false, 
                      err,
                    });
                  }
                })
              })
            }
          })
        });
        console.log(String(deliveryPK.length)+" recored inserted workItem table")
        res.json({
          sucess: true
        })
      });
    }
    else{
      res.json({
        sucess: False,
        msg: "already exists workPK"
      })
    }
  })
});

app.get("/works/check", (req, res) => {
  deliveryManID = req.query.deliveryManID
  type = ['일반 배송', '집화 / 반품']
  time = ['주간', '새벽']
  terminalAddress = {'서울' : '서울 서초구 4번길 14-2길'}
  connection.query(String.format("SELECT * FROM workInfo WHERE deliveryManID='{0}'", deliveryManID), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
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
      rows: rows
    })
  })
});

app.get("/works/itemlist", (req, res) => {
  workPK = req.query.workPK
  connection.query(String.format("SELECT * FROM workItem WHERE workPK={0}", workPK), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
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
      rows: rows
    })
  })
});

app.get("/map/position", (req, res) => {
  async function regionLatLongResult(locationName, len){
    let options = {
      provider: 'openstreetmap'
      //provider: 'google',
      //apiKey: 'AIzaSyAABBZO0m-jR5wY9qu8ErDzlBb_OLlQbRE'
    };
    let geoCoder = nodeGeocoder(options);
    Lat = 0
    Long = 0
    addr = []
    geoCoder.geocode(locationName).then((res)=> {
      // console.log(res[0].latitude);
      // console.log(res[0].longitude);
      Lat = res[0].latitude; //위도
      Long =  res[0].longitude; //경도
    }).then((result) => {
      // console.log(Lat, Long)
      addr.push([String(Lat), String(Long)]);
    }).then((result) => {
      if(len == addr.length){
        res.json({
          start: addr[0],
          waypoint: addr.slice(1,-1),
          finish: addr[addr.length-1]
        })
      }
    })
  }

  terminalAddr = req.query.terminalAddr
  deliveryPK = req.query.deliveryPK
  connection.query(String.format("SELECT receiverAddr1, receiverAddr2, receiverAddr3 FROM workItem WHERE deliveryPK IN ({0})", deliveryPK), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
    }
    else{
      regionLatLongResult(terminalAddr, rows.length+1)
      rows.map((v) => {
        address = [v['receiverAddr1'], v['receiverAddr2'], v['receiverAddr3']].join(' ')
        regionLatLongResult(address, rows.length+1)
      })
    }
  })
});

app.get("/item/detail", (req, res) => {
  deliveryPK = req.query.deliveryPK
  connection.query(String.format("SELECT * FROM workItem AS a INNER JOIN itemDetail AS b WHERE a.deliveryPK = b.deliveryPK AND a.deliveryPK={0}", deliveryPK), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
    }
    else{
      rows = rows[0]
      res.json({
        deliveryPK: rows['deliveryPK'],
        workPK: rows['workPK'],
        sender: rows['sender'],
        receiver: rows['receiver'],
        itemCategory: rows['itemCategory'],
        senderAddr: [rows['senderAddr1'], rows['senderAddr2'], rows['senderAddr3']].join(' '),
        receiverAddr: [rows['receiverAddr1'], rows['receiverAddr2'], rows['receiverAddr3']].join(' '),
        complete: rows['complete'],
        comment: rows['comment'],
        CompleteTime: rows['CompleteTime'],
        receipt: rows['receipt'],
        recipient: rows['recipient'],
        picture: rows['picture']
      })
    }
  })
})

app.post("/item/update", (req, res) => {
  console.log(req.query)

  deliveryPK = req.query.deliveryPK
  complete = req.query.complete
  receipt = req.query.receipt
  receipient = req.query.receipient
  picture = req.query.picture
  console.log(picture)
  connection.query(String.format("UPDATE itemDetail SET completeTime=NOW() AND receipt='{0}' AND recipient='{1}' AND picture='{2}' WHERE deliveryPK={3}", receipt, receipient, picture, deliveryPK), (err, rows) => {
    connection.query(String.format("UPDATE workItem SET complete={0} WHERE deliveryPK={1}", complete, deliveryPK), (err, row) => {})
    if(err){
      res.json({
        success: false, 
        err,
      });
    }
    else{
      res.json({
        success: true,
      });
    }
  })
})

app.listen(3000, () => console.log("listining on port 3000"));