#!/bin/bash
eval $(aws ecr get-login --region eu-west-2 --no-include-email)
docker pull 581440852996.dkr.ecr.eu-west-2.amazonaws.com/unininja-api:latest
docker service update --image 581440852996.dkr.ecr.eu-west-2.amazonaws.com/unininja-api:latest unininja-api
