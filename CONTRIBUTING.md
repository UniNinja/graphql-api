# Contributing to the UniNinja API
Thank you for showing interest in contributing to the UniNinja API. Unfortunately, as this project is currently being carried out as a University project, we only accept contributions from the UNiNinja team:

- [Daniel Arthur](https://github.com/DanielArthurUK)
- [Harry Collins](https://github.com/harrygcollins)
- [Loic Verrall](https://github.com/LoicVerrall)
- [Mark Paice](https://github.com/msp26ssx)
- [Alex Tang](https://github.com/Tang-1996)


## Docker 🐳

The UniNinja API uses Docker. To run the API locally, you should first [download Docker here](https://docs.docker.com/install/). Once you have Docker installed, you can perform the following steps to run the API locally. Firstly, [you must obtain the `.env` environment variables file](#obtaining-the-env-file). This file is only obtainable by the UniNinja team due to security reasons.

1. You must first fork and clone the repo: `git clone https://github.com/UniNinja/graphql-api`
2. Move into the repo directory and install dependencies: `cd graphql-api && npm install`
3. `docker build -t unininja-api .`
4. `docker run -p 3000:3000 --env-file .env unininja-api`
5. Now, go to `localhost:3000` \(or the IP address Docker starts with on port `3000`\) and you will see the API working locally.

## Obtaining the `.env` file
If you are part of the UniNinja team and you need access to the `.env` file to deploy the API on your local machine, you can contact [developers@uni.ninja](mailto:developers@uni.ninja).

## Branching model :octocat:
The `graphql-api` repo has a `master` branch where you will find the latest stable *production* release. Any code that is not yet deemed worthy for production will be on its own development branch. When introducing new features that are not backwards compatible, please ensure to make a pull request to the development branch and not the master branch.
