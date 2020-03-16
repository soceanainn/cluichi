#!/bin/bash

if [[ $1 = "" ]]; then
    echo "Please pass the path of the .txt file downloaded from 'https://www.tearma.ie/ioslodail/'"
    exit 1;
fi

cat $1 | grep "\t[a-zA-ZáéíóúÁÉÍÓÚ]*\t[0-9]*" | awk -F "\t" '{print $2}' | tr '[:upper:]' '[:lower:]'|  sort | uniq  > /tmp/focal.txt
python3 utils/prep_focail_util.py /tmp/focal.txt > focail.js
