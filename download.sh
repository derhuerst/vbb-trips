#!/bin/sh

if [[ -ne $GITHUB_TOKEN ]]; then
	echo 'Downloading vbb-gtfs using access token.'
	curl -# -H "Authorization: token $GITHUB_TOKEN" -L 'https://github.com/derhuerst/vbb-gtfs/archive/master.zip' | tar -xf- --strip-components 1 -C build/data/
else
	echo 'Downloading vbb-gtfs without access token.'
	curl -# -L 'https://github.com/derhuerst/vbb-gtfs/archive/master.zip' | tar -xf- --strip-components 1 -C build/data/
fi
