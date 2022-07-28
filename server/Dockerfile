FROM node:15.12.0-alpine3.12

WORKDIR /app
COPY package*.json /app
RUN npm install
RUN npm install --save express
RUN npm install --save sequelize
RUN npm install --save mysql
RUN npm install -g node-geocoder
RUN npm install -g nodemon
COPY . /app
CMD ["nodemon", "-L", "app.js"]
EXPOSE 3000