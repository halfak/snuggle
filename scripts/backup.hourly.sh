#!/bin/sh
if [ $# -eq 0 ]; then
	echo "No backup directory provided"
	exit 1
fi
BACKUP_DIR=$1
if [ ! -d "$BACKUP_DIR" ]; then
	echo "$BACKUP_DIR is not a directory"
	exit 1
fi

PREFIX="mongo.snuggle.hourly"
HOUR="$(date +%H)"
TIMESTAMP="$(date +%Y-%m-%d)"

DUMP_DIR="$BACKUP_DIR/$PREFIX.$HOUR"
OLD_FILES="$BACKUP_DIR/$PREFIX.$HOUR.*.tar.gz"
COMPRESSED_FILE="$BACKUP_DIR/$PREFIX.$HOUR.$TIMESTAMP.tar.gz"

#echo $DAY_OF_WEEK
#echo $TIMESTAMP

# Make dump
mongodump --db=snuggle --out="$DUMP_DIR"

# Clear out old dump file
rm $OLD_FILES

# Compress
tar -czf "$COMPRESSED_FILE" "$DUMP_DIR"

# Remove dump directory
rm -rf "$DUMP_DIR"

echo "New hourly backup $COMPRESSED_FILE"
