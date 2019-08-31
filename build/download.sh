#!/bin/sh

cd $(dirname $0)/data

base_url='https://vbb-gtfs.jannisr.de/latest/'
download () {
	curl -s -z --compressed $base_url$1 >$1
}

download 'agency.csv'
download 'calendar.csv'
download 'calendar_dates.csv'
download 'routes.csv'
download 'stop_times.csv'
download 'trips.csv'

ls -lh *.csv
