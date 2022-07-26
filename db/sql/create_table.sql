CREATE TABLE deliveryInfo(
       id INT PRIMARY KEY, 
       deliveryDate VARCHAR(10),
       deliveryTime VARCHAR(10),
       deliveryMan INT,
       sender VARCHAR(100),
       reciver VARCHAR(100),
       itemCategory VARCHAR(10),
       senderAddr1 VARCHAR(60),
       senderAddr2 VARCHAR(60),
       senderAddr3 VARCHAR(60),
       reciverAddr1 VARCHAR(60),
       reciverAddr2 VARCHAR(60),
       reciverAddr3 VARCHAR(60)
);
LOAD DATA INFILE '/var/lib/mysql-files/cj_delivery.csv' INTO TABLE deliveryInfo FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
