FROM mhart/alpine-node:latest
WORKDIR /app

# Install all dependencies to for expressjs
COPY package.json package-lock.json ./
RUN npm install  

# Copy build and server.js over
COPY . ./

EXPOSE 8080

# The default command for this container.
# Start expressjs for production
CMD [ "npm", "start" ]

# Not default, to run on localhost specify 'npm test' at the docker run command. 
# Start expressjs on localhost
# CMD [ "npm", "test" ]


# Faster.
# docker save philipp-sc/learning:latest | gzip > philipp-sc_learning_latest.tar.gz
# docker load < philipp-sc_learning_latest.tar.gz

# Much better compression.
# docker save philipp-sc/learning:latest | xz > philipp-sc_learning_latest_localhost.xz
# docker load < philipp-sc_learning_latest.xz

# Check list

# docker build -t philipp-sc/learning .

	# in case there already is a running container
	# docker container stop learning-xtreme 

		# in case you want to override the previous container
		# docker container rm learning-xtreme

			# both
			# docker container stop learning-xtreme;docker container rm learning-xtreme

# create & start container
# docker run --name=learning-xtreme -d -p 8080:8080 philipp-sc/learning npm start
# docker run --name=learning-xtreme -d -p 8080:8080 philipp-sc/learning npm test


# check
# docker container ls
# docker logs learning-xtreme
