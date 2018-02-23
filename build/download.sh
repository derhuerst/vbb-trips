#!/bin/sh

cd $(dirname $0)

gzip='accept-encoding: gzip'
base_url='https://vbb-gtfs.jannisr.de/latest/'
download () {
	wget -nc -qc --header=$gzip -O data/$1 $base_url$1
}

download 'agency.txt'
download 'calendar.txt'
download 'calendar_dates.txt'
download 'routes.txt'
download 'stop_times.txt'
download 'trips.txt'
