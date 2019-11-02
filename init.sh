#!/bin/bash
if [ ! "$(docker network list | grep "docker-network")" ]; then docker network create -d bridge --subnet 192.160.0.0/24 --gateway 192.160.0.1 docker-network; fi
# docker-compose -p favorites --verbose -f docker-compose.yml build
docker-compose -p favorites -f docker-compose.yml up --detach --build
