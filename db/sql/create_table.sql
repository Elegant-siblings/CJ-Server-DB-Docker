CREATE TABLE deliveryInfo(
       id INT PRIMARY KEY, 
       deliveryDate VARCHAR(10),
       deliveryTime VARCHAR(10),
       deliveryMan INT,
       sender VARCHAR(100),
       senderAddress VARCHAR(60),
       reciver VARCHAR(100),
       reciverAddress VARCHAR(60),
       deliveryCategory VARCHAR(10)
);
LOAD DATA INFILE '/var/lib/mysql-files/cj_delivery.csv' INTO TABLE deliveryInfo FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;


-- CREATE TABLE Student(
--        student_id INT PRIMARY KEY AUTO_INCREMENT, 
--        student_name VARCHAR(60), 
--        student_age INT
-- );
-- INSERT INTO Student(
--        student_name, 
--        student_age) 
-- VALUES(
--        "Shubham verma", 
--         21
-- );
-- INSERT INTO Student(
--        student_name, 
--        student_age) 
-- VALUES(
--        "Utkarsh verma", 
--         23
-- );
-- ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password'; 
-- flush privileges;

