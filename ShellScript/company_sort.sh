#!/bin/bash

# ======================================================
# S&P 500 Companies CSV Processor
# Downloads CSV and prints:
# Company Name | Headquarters | Founded Year
# Sorted by Founded Year
# ======================================================

URL="https://raw.githubusercontent.com/datasets/s-and-p-500-companies/refs/heads/main/data/constituents.csv"

TMP_FILE=$(mktemp)

# Download CSV
if ! curl -sL "$URL" -o "$TMP_FILE"; then
    echo "Error: Unable to download CSV."
    exit 1
fi

echo "Company Name | Headquarters | Founded Year"
echo "--------------------------------------------------------------"

tail -n +2 "$TMP_FILE" | \
awk -F',' '
{
    company = $2
    location = $5
    founded = $8

    year = founded

    # Extract first 4-digit year
    if (match(founded, /[0-9]{4}/)) {
        year = substr(founded, RSTART, RLENGTH)
    } else {
        year = 9999
    }

    print year "|" company "|" location
}' | \
sort -n | \
awk -F'|' '{
    if ($1 == 9999)
        $1 = "Unknown"

    printf "%-45s %-30s %s\n", $2, $3, $1
}'

rm "$TMP_FILE"