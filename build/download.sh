#!/bin/sh

set -e

cd $(dirname $0)/data

base_url='https://vbb-gtfs.jannisr.de/latest/'
# todo: use https://gist.github.com/derhuerst/745cf09fe5f3ea2569948dd215bbfe1a ?
download () {
	curl -fsSL --compressed -H 'User-Agent: derhuerst/vbb-trips build' \
		--etag-compare "$1.etag" --etag-save "$1.etag" \
		"$base_url$1" -o "$1"
}

download 'agency.csv'
download 'calendar.csv'
download 'calendar_dates.csv'
download 'routes.csv'
download 'stop_times.csv'
download 'trips.csv'

../../node_modules/gtfs-utils/sort.sh

ls -lh *.csv
