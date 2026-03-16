#!/bin/bash

OUTPUT="jwendell-timezone.zip"
ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/." && pwd)"

(
cd "${ROOTDIR}"
rm -f "${OUTPUT}"
zip -r -q "${OUTPUT}" . \
    --exclude "*.git*" \
    --exclude "backlog/*" \
    --exclude "claudedocs/*" \
    --exclude ".claude/*" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude "*.txt"
)

echo "Created ${ROOTDIR}/${OUTPUT}"
