#!/bin/sh

set -e

cd $(dirname $0)/data

base_url='https://vbb-gtfs.jannisr.de/latest/'
download () {
	curl -z -L --compressed --etag-compare "$1.etag" --etag-save "$1.etag" $base_url$1 -o $1
}

download 'agency.csv'
download 'calendar.csv'
download 'calendar_dates.csv'
download 'routes.csv'
download 'stop_times.csv'
download 'trips.csv'

ls -lh *.csv
