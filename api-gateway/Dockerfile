# Use official node image as the base image
 FROM node:18-alpine

 #set the working directory
 WORKDIR /app

 #Add the source code to app
 COPY package*.json ./

 #install all the dependencies
#  RUN npm install
RUN npm install

 COPY  . .

 #Expose port 3000
 EXPOSE 3000

 #command the running the project 
 CMD [ "node", "src/server.js" ]