FROM mysql

# COPY ./cj_delivery.csv /var/lib/mysql-files/
# COPY ./delivery_final.csv /var/lib/mysql-files/
COPY ./delivery_pickup_final_ver /var/lib/mysql-files/

COPY ./sql/create_table.sql /docker-entrypoint-initdb.d/

RUN ["chmod", "+x", "/docker-entrypoint-initdb.d/create_table.sql"]

EXPOSE 3306