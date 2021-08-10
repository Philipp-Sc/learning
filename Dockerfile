
# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
# current-slim
FROM node:16-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm install -g npm
RUN npm install
#RUN npm audit fix --force
RUN npm install @wmik/use-media-recorder --force

# Copy local code to the container image.
COPY . ./

# Build the app
RUN npm run build

# Expose the port.
EXPOSE 8080

# Run the web service on container startup.
CMD [ "npm", "start" ]


# Check list
# build 
# sudo docker build -t philipp-sc/learning .

# in case there already is a running container
# sudo docker container stop learning-xtreme 

# in case you want to override the previous container
# sudo docker container rm learning-xtreme

# create & start container
# sudo docker run --name=learning-xtreme -d -p 8080:8080 philipp-sc/learning npm start

# check
# sudo docker container ls
# sudo docker logs learning-xtreme

# export
# sudo docker save -o  learning.tar philipp-sc/learning

# stop
# sudo docker container stop learning-xtreme

# import
# docker import /path/to/exampleimage.tgz
