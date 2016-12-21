#!/bin/sh

curl -L --compressed https://vbb-gtfs.jannisr.de/latest/calendar.txt > build/data/calendar.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/calendar_dates.txt > build/data/calendar_dates.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/routes.txt > build/data/routes.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/stop_times.txt > build/data/stop_times.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/trips.txt > build/data/trips.txt
