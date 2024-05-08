#!/bin/bash

if [ $# -ne 1 ]; then
    echo "use: $0 <data_value>"
    exit 1
fi

data="$1"

curl -X POST -H "Content-Type: application/json" -d "{\"data\": \"$data\"}" http://localhost:3000/addBlock