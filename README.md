# UniNinja GraphQL API
[![Build Status](https://travis-ci.org/UniNinja/graphql-api.svg?branch=master)](https://travis-ci.org/UniNinja/graphql-api)

## Docker 🐳
The UniNinja API uses Docker. To run the API locally, you should first [download Docker here](https://docs.docker.com/install/). Once you have Docker installed, you can perform the following steps to run the API locally. Firstly, you must obtain the `.env` environment variables file. This file is only obtainable by the UniNinja team due to security reasons.

1. You must first clone the repo (or fork and clone if you plan on contributing to the project):
`git clone https://github.com/UniNinja/graphql-api`

2. Move into the repo directory and install dependencies: `cd graphql-api && npm install`

3. `docker build -t unininja-api .`

4. `docker run -p 3000:3000 --env-file .env unininja-api`

5. Now, go to `localhost:3000` (or the IP address Docker starts with on port `3000`) and you will see the API working locally.
