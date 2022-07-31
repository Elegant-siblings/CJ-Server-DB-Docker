CREATE TABLE workInfo(
       workPK INT AUTO_INCREMENT PRIMARY KEY,
       deliveryManID VARCHAR(16),
       deliveryDate VARCHAR(10),
       deliveryType Boolean,
       deliveryTime Boolean,
       deliveryCar VARCHAR(10),
       terminalAddr VARCHAR(100),
       workState INT,
       comment VARCHAR(100)
);
CREATE TABLE workItem(
       deliveryPK INT PRIMARY KEY,
       workPK INT,
       sender VARCHAR(100),
       receiver VARCHAR(100),
       itemCategory VARCHAR(10),
       senderAddr1 VARCHAR(60),
       senderAddr2 VARCHAR(60),
       senderAddr3 VARCHAR(60),
       receiverAddr1 VARCHAR(60),
       receiverAddr2 VARCHAR(60),
       receiverAddr3 VARCHAR(60),
       complete INT,
       seatNum INT
);
CREATE TABLE itemDetail(
       deliveryPK INT PRIMARY KEY,
       comment VARCHAR(200),
       completeTime VARCHAR(40),
       receipt VARCHAR(15),
       recipient VARCHAR(15),
       picture BLOB
);
CREATE TABLE workDetail(
       workPK INT PRIMARY KEY,
       deliveryManID VARCHAR(16),
       itemNum INT,
       completeNum INT,
       income INT,
       startTime VARCHAR(40),
       endTime VARCHAR(40)
);
CREATE TABLE userInfo(
       userID VARCHAR(20) PRIMARY KEY,
       userPassword VARCHAR(20),
       userIdentityNum VARCHAR(20),
       userPhone VARCHAR(20),
       userAccount VARCHAR(30),
       deliveryManID VARCHAR(16),
       registerDate VARCHAR(30)
);
CREATE TABLE deliveryInfo(
       deliveryPK INT PRIMARY KEY, 
       deliveryDate VARCHAR(10),
       deliveryTime VARCHAR(10),
       deliveryMan INT,
       sender VARCHAR(100),
       receiver VARCHAR(100),
       itemCategory VARCHAR(10),
       senderAddr1 VARCHAR(60),
       senderAddr2 VARCHAR(60),
       senderAddr3 VARCHAR(60),
       receiverAddr1 VARCHAR(60),
       receiverAddr2 VARCHAR(60),
       receiverAddr3 VARCHAR(60)
);
SET GLOBAL TIME_ZONE = 'Asia/Seoul';
SET TIME_ZONE = 'Asia/Seoul';
LOAD DATA INFILE '/var/lib/mysql-files/cj_delivery.csv' INTO TABLE deliveryInfo FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
