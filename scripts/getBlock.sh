#!/bin/bash

if [ $# -ne 1 ]; then
    echo "use: $0 <id_value>"
    exit 1
fi

id="$1"

curl -X POST -H "Content-Type: application/json" -d "{\"id\": \"$id\"}" http://localhost:3000/getBlock