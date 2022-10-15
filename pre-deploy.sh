#!/usr/bin/env bash

echo "Got PORT as ${PORT}";
printf "\nNX_SERVER_PORT=${PORT}" >> .build.env;