#!/bin/bash

OUTPUT="jwendell-timezone.zip"
ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/." && pwd)"

(
cd "${ROOTDIR}"
rm -f "${OUTPUT}"
zip -r -q "${OUTPUT}" . --exclude "*.git*"
)

echo "Created ${ROOTDIR}/${OUTPUT}"
