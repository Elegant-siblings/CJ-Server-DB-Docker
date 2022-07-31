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

app.get("/workDetail", (req, res) => {
  connection.query("SELECT * FROM workDetail", (err, rows) => {
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

app.get("/userInfo", (req, res) => {
  connection.query("SELECT * FROM userInfo", (err, rows) => {
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
})

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
        connection.query(String.format("INSERT INTO workInfo VALUES (NULL, {0}, {1}, {2}, {3}, {4}, {5}, 0, NULL)",
        deliveryManID,deliveryDate,deliveryType,deliveryTime,deliveryCar,terminalAddr), (err, rows) => {
        if (err) {
          res.json({
            success: false, 
            err,
          });
        }
        else{
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
                    
                    }
                  })
                })
              }
            })
          });
          console.log(String(deliveryPK.length)+" recored inserted workItem table")
          res.json({
            success: true
          })
        }
      });
    }
    else{
      res.json({
        success: False,
        msg: "already exists workPK"
      })
    }
  })
});

app.get("/works/check", (req, res) => {
  deliveryManID = req.query.deliveryManID
  type = ['일반 배송', '집화 / 반품']
  time = ['주간', '새벽']
  terminalAddress = {
    '서울' : '서울 강서구 양천로 373',
    '부산' : '부산 사상구 장인로77번길 69',
    '대구' : '대구 동구 금호강변로 57',
    '인천' : '인천 계양구 아나지로 480',
    '광주' : '광주 광산구 평동산단3번로 205',
    '대전' : '대전 대덕구 대덕대로1447번길 39',
    '울산' : '울산 북구 진장유통1로 59',
    '경기' : '경기 광주시 초월읍 산수로 642-70',
    '충북' : '충북 청주시 서원구 남이면',
    '충남' : '충남 예산군 응봉면 예당로 1729-32',
    '전북' : '전북 익산시 동서로47길 22-23',
    '전남' : '전남 목포시',
    '강원' : '강원 강릉시 경포로',
    '경북' : '경북 김천시',
    '경남' : '경남 진주시 정촌면 화개천로 12',
  }
  connection.query(String.format("SELECT * FROM workInfo WHERE deliveryManID='{0}'", deliveryManID), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
    }
    else{
      rows = rows.map((v) => { return {
        workPK: v['workPK'],
        deliveryDate: v['deliveryDate'],
        deliveryType: type[v['deliveryType']],
        deliveryTime: time[v['deliveryTime']],
        deliveryCar: v['deliveryCar'],
        terminalAddr: terminalAddress[v['terminalAddr']],
        workState: v['workState'],
        comment: v['comment']
      }})
      res.json({
        rows: rows
      })
    }
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
    else{
      rows = rows.map((v) => { return {
        deliveryPK: v['deliveryPK'],
        sender: v['sender'],
        receiver: v['receiver'],
        itemCategory: v['itemCategory'],
        senderAddr: [v['senderAddr1'],v['senderAddr2'],v['senderAddr3']].join(' '),
        receiverAddr: [v['receiverAddr1'],v['receiverAddr2'],v['receiverAddr3']].join(' '),
        complete: v['complete']
      }})
      res.json({
        rows: rows
      })
    }
  })
});

app.get("/works/start", (req, res) => {
  workPK = req.query.workPK
  deliveryManID = req.query.deliveryManID
  connection.query(String.format("SELECT COUNT(*) FROM workItem WHERE workPK={0} AND complete=0", workPK), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
    }
    else{
      itemNum = rows[0]['COUNT(*)']
      connection.query(String.format("INSERT INTO workDetail VALUES ({0}, '{1}', {2}, NULL, 0, DATE_FORMAT(NOW(),'%Y.%m.%d. %r'), NULL)", workPK, deliveryManID, itemNum), (err, row) => {
        if(err){
          res.json({
            success: false,
            err
          })
        }
        else{
          res.json({
            success: true,
          })
        }
      })
    }
  })
})

app.get("/works/update", (req, res) => {
  workPK = req.query.workPK
  workState = req.query.workState
  comment = ""
  if(workState == 1){
    today = new Date();
    comment = today.toLocaleString('ko-kr')+" 모집 취소하였음."
  }
  connection.query(String.format("UPDATE workInfo SET workState={0}, comment='{1}' WHERE workPK={2}", workState, comment, workPK), (err, rows) => {
    if(err){
      res.json({
        success: false, 
        err,
      });
    }
    else{
      res.json({
        success: true
      });
    }
  });
});

app.get("/works/complete", (req, res) => {
  workPK = req.query.workPK
  completeNum = req.query.completeNum
  income = completeNum * 3000
  connection.query(String.format("UPDATE workDetail SET endTime=DATE_FORMAT(NOW(),'%Y.%m.%d. %r'), completeNum={0}, income={1} WHERE workPK={2}", completeNum, income, workPK), (err, rows) => {
    if(err){
      res.json({
        success: false,
        err
      })
    }
    else{
      connection.query(String.format("UPDATE workInfo SET workState={0} WHERE workPK={1}", 2, workPK), (err, rows) => {
        if(err){
          res.json({
            success: false,
            err
          })
        }
        else{
          res.json({
            success: true
          })
        }
      })
    }
  })
})

app.get("/works/detail", (req, res) => {
  workPK = req.query.workPK
  connection.query(String.format("SELECT a.*, b.itemNum, b.completeNum, b.income, b.startTime, b.endTime FROM workInfo AS a INNER JOIN workDetail AS b WHERE a.workPK={0} AND a.workPK = b.workPK", workPK), (err, rows) => {
    if(err){
      res.json({
        success: false,
        err
      })
    }
    else{
      workInfo = rows[0]
      connection.query(String.format("SELECT * FROM workItem WHERE workPK={0} AND complete!=3", workPK), (err, rows) => {
        if(err){
          res.json({
            success: false,
            err
          })
        }
        else{
          itemList = rows.map((v) => {
            return {
              deliveryPK: v['deliveryPK'],
              itemCategory: v['itemCategory'],
              senderAddr: [v['senderAddr1'],v['senderAddr2'],v['senderAddr3']].join(' '),
              receiverAddr: [v['receiverAddr1'],v['receiverAddr2'],v['receiverAddr3']].join(' '),
              complete: v['complete']
            }
          })
          res.json({
            workInfo: workInfo,
            itemList: itemList
          })
        }
      })
    }
  })
})

app.get("/map/terminal", (req, res) => {
  terminalAddress = {
    '서울 강서구 양천로 373' : ["37.5733438", "126.8167715"],
    '부산 사상구 장인로77번길 69' : ["35.1457806", "128.9784951"],
    '대구 동구 금호강변로 57' : ["35.8616744", "128.7095763"],
    '인천 계양구 아나지로 480' : ["37.525587", "126.7501383"],
    '광주 광산구 평동산단3번로 205' : ["35.1307411", "126.7672984"],
    '대전 대덕구 대덕대로1447번길 39' : ["36.44879455", "127.40697911243774"],
    '울산 북구 진장유통1로 59' : ["35.5775643", "129.354697"],
    '경기 광주시 초월읍 산수로 642-70' : ["37.3711159", "127.3181407"],
    '충북 청주시 서원구 남이면' : ["36.5606627", "127.433587"],
    '충남 예산군 응봉면 예당로 1729-32' : ["36.6713623", "126.7424893"],
    '전북 익산시 동서로47길 22-23' : ["35.9528468", "126.977473"],
    '전남 목포시' : ["34.7903335", "126.3847547"],
    '강원 강릉시 경포로 ' : ["37.7525313", "128.8759523"],
    '경북 김천시' : ["36.07783", "128.09022"],
    '경남 진주시 정촌면 화개천로 12' : ["35.119350499999996", "128.0995967512685"],
  }

  terminalAddr = req.query.terminalAddr
  if(terminalAddr in terminalAddress){
    res.json({
      success: true,
      position: terminalAddress[terminalAddr]
    })
  }
  else{
    res.json({
      success: false,
      position: []
    })
  }
})


app.get("/map/position", (req, res) => {
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
      receiveCount = 0
      function regionLatLongResult(locationName, count, len){
        let options = {
          provider: 'openstreetmap'
          //provider: 'google',
          //apiKey: 'AIzaSyAABBZO0m-jR5wY9qu8ErDzlBb_OLlQbRE'
        };
        let geoCoder = nodeGeocoder(options);
        Lat = 0
        Long = 0
        geoCoder.geocode(locationName).then((res)=> {
          // console.log(res[0])
          
          // console.log(res[0].latitude);
          // console.log(res[0].longitude);
          Lat = res[0].latitude; //위도
          Long =  res[0].longitude; //경도
        }).then((result) => {
          // console.log(Lat, Long)
          addr[count] = [String(Lat), String(Long)];
          receiveCount += 1
        }).then((result) => {
          if(receiveCount == addr.length-1){
            // console.log(addr)
            res.json({
              start: addr[0],
              waypoint: addr.slice(1,-2),
              finish: addr[addr.length-2]
            })
          }
        })
      }
      addr = Array.from({length: rows.length+2}, () => 0);
      regionLatLongResult(terminalAddr, 0, rows.length+1)
      count = 1
      rows.map((v) => {
        address = [v['receiverAddr1'], v['receiverAddr2'], v['receiverAddr3']].join(' ')
        regionLatLongResult(address, count, rows.length+1)
        count += 1
      })
    }
  })
});

app.get("/item/detail", (req, res) => {
  deliveryPK = req.query.deliveryPK
  connection.query(String.format("SELECT * FROM workItem AS a INNER JOIN itemDetail AS b WHERE a.deliveryPK = b.deliveryPK AND a.deliveryPK={0} AND a.complete!=3", deliveryPK), (err, rows) => {
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
        completeTime: rows['completeTime'],
        receipt: rows['receipt'],
        recipient: rows['recipient'],
        picture: rows['picture']
      })
    }
  })
})

app.post("/item/update", (req, res) => {
  deliveryPK = req.query.deliveryPK
  complete = req.query.complete
  receipt = req.query.receipt
  receipient = req.query.receipient
  picture = req.query.picture
  console.log(picture)
  connection.query(String.format("UPDATE itemDetail SET completeTime=DATE_FORMAT(NOW(),'%Y.%m.%d. %r'), receipt='{0}', recipient='{1}', picture='{2}' WHERE deliveryPK={3}", receipt, receipient, picture, deliveryPK), (err, rows) => {
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

app.get("/item/scan", (req, res) => {
  deliveryPK = req.query.deliveryPK
  connection.query(String.format("UPDATE workItem SET complete=3 WHERE deliveryPk IN ({0})", deliveryPK), (err, rows) => {
    if(err){
      res.json({
        success: false,
        err
      })
    }
    else{
      res.json({
        success: true,
      })
    }
  })
})

app.get("/user/idcheck", (req, res) => {
  userID = req.query.userID
  connection.query(String.format("SELECT COUNT(*) FROM userInfo WHERE userID='{0}'", userID), (err, rows) => {
    if(err){
      res.json({
        success: false,
        err
      })
    }
    else{
      res.json({
        existence : Boolean(rows[0]['COUNT(*)'])
      })
    }
  })
})

function makeManID(userIdentityNum){
  ManID = ""
  for(var i=0; i < userIdentityNum.length; i++){
    if(userIdentityNum[i] == '-') continue
    ManID +=  String.fromCharCode((Number(userIdentityNum[i])+i+30)%26+65)
  }
  ManID += ManID.slice(3,6)
  return ManID
}

app.get("/user/register", (req, res) => {
  userID = req.query.userID
  userPassword = req.query.userPassword
  userIdentityNum = req.query.userIdentityNum
  userPhone = req.query.userPhone
  userAccount = req.query.userAccount
  deliveryManID = makeManID(userIdentityNum)  
  connection.query(String.format("INSERT INTO userInfo VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', DATE_FORMAT(NOW(),'%Y.%m.%d. %r'))",userID, userPassword, userIdentityNum, userPhone, userAccount, deliveryManID), (err, rows) => {
    if(err){
      res.json({
        success: false,
        err
      })
    }
    else{
      res.json({
        success: true,
      })
    }
  })
})

app.get("/user/login", (req, res) => {
  userID = req.query.userID
  userPassword = req.query.userPassword
  connection.query(String.format("SELECT COUNT(*) FROM userInfo WHERE userID='{0}'", userID), (err, rows) => {
    if(err){
      res.json({
        success: false,
        userInfo: [],
        msg: "DB 접속 문제"
      })
    }
    else{
      idcheck = Boolean(rows[0]['COUNT(*)'])
      if(idcheck){
        console.log(String.format("SELECT * FROM userInfo WHERE userID='{0}' AND userPassword='{1}'", userID, userPassword))
        connection.query(String.format("SELECT * FROM userInfo WHERE userID='{0}' AND userPassword='{1}'", userID, userPassword), (err, row) => {
          if(err){
            res.json({
              success: false,
              userInfo: [],
              msg: "DB 접속 문제"
            })
          }
          else{
            logincheck = Boolean(row.length)
            if(logincheck){
              res.json({
                success: true,
                userInfo: row,
                msg: "로그인에 성공하였습니다."
              })
            }
            else{
              res.json({
                success: false,
                userInfo: [],
                msg: "비밀번호가 일치하지 않습니다."
              })
            }
          }
        })
      }
      else{
        res.json({
          success: false,
          userInfo: [],
          msg: "존재하지 않는 아이디 입니다."
        })
      }
    }
  })
})

app.listen(3000, () => {
  console.log("listining on port 3000")
});


