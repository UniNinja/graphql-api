echo "building docker image"
docker build -t unininja-api .
echo "running docker image"
docker run -p 3000:3000 --env-file .env unininja-api
