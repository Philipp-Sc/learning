FROM mhart/alpine-node:latest

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install -g npm
RUN npm install 
RUN npm install @wmik/use-media-recorder --force
 
COPY . ./

RUN npm run build

Expose the port.
EXPOSE 8080
 
CMD [ "npm", "start" ]