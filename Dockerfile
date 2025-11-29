# kudos: https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app.html

FROM node:24-alpine

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .
# a bad workaround b/c of lacking https://fly.io/docs/reference/build-secrets/
COPY .env .
RUN npm run build \
    && rm .env

EXPOSE 8080
CMD [ "http-server", "dist" ]