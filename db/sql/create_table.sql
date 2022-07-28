CREATE TABLE workInfo(
       workPK INT AUTO_INCREMENT PRIMARY KEY,
       deliveryManID VARCHAR(16),
       deliveryDate VARCHAR(10),
       deliveryType Boolean,
       deliveryTime Boolean,
       deliveryCar VARCHAR(10),
       terminalAddr VARCHAR(100)
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
       complete INT
);
CREATE TABLE itemDetail(
       deliveryPK INT PRIMARY KEY,
       comment VARCHAR(200),
       completeTime DATETIME,
       receipt VARCHAR(15),
       recipient VARCHAR(15),
       picture BLOB
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
LOAD DATA INFILE '/var/lib/mysql-files/cj_delivery.csv' INTO TABLE deliveryInfo FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
