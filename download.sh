#!/bin/sh

URL='https://github.com/derhuerst/vbb-gtfs/archive/master.zip'

if [[ -ne $GITHUB_TOKEN ]]; then
	echo 'Downloading vbb-gtfs using access token.'
	curl -# -H "Authorization: token $GITHUB_TOKEN" -L $URL > data.zip
else
	echo 'Downloading vbb-gtfs without access token.'
	curl -# -L $URL > data.zip
fi

unzip -ju data.zip -d build/data
rm data.zip
