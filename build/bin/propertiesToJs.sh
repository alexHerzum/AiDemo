#!/bin/bash
#find script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../../ && pwd )"
echo $DIR
#Variables
LANGUAGE=$1
OUTPUT=$DIR/.tmp/aui.properties.js
INPUT=$DIR/src/i18n/aui_$LANGUAGE.properties

# If no language is passed in or using en, just use the aui.properties file
if [ "$LANGUAGE" = "en" ] || [ -z $LANGUAGE ]
then
INPUT=$DIR/src/i18n/aui.properties
fi

echo reading $INPUT and converting to $OUTPUT
mkdir -p .tmp
#process properties file
awk -F= '
BEGIN {
    print "AJS.I18n.keys = {};"
}
{
    gsub(/ /,"",$1);
    gsub(/^[ ]+/,"",$2);
    gsub(/\"/, "\\\"", $2);
    print "AJS.I18n.keys[\""$1"\"] = \"" $2 "\";";
}
END {

}
' $INPUT > $OUTPUT