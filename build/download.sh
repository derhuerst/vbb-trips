#!/bin/sh

cd $(dirname $0)/data

base_url='https://vbb-gtfs.jannisr.de/latest/'
download () {
	curl -s -z --compressed $base_url$1 >$1
}

download 'agency.txt'
download 'calendar.txt'
download 'calendar_dates.txt'
download 'routes.txt'
download 'stop_times.txt'
download 'trips.txt'

ls -lh *.txt
