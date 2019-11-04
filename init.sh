#!/bin/bash
if [ ! "$(docker network list | grep "docker-network")" ]; then docker network create -d bridge --subnet 192.160.0.0/24 --gateway 192.160.0.1 docker-network; fi
docker-compose -p favorites -f docker-compose.yml up --detach --build

# migration
docker cp ./deploy/init.sql mariadb:/tmp
docker cp ./deploy/create.sql mariadb:/tmp
docker cp ./deploy/inituser.sh mariadb:/tmp
docker cp ./deploy/migration.sh mariadb:/tmp

docker exec mariadb /tmp/inituser.sh
docker exec mariadb /tmp/migration.sh

# npm install
cd api
npm install
cd ..
cd transfer
npm install
cd ..
