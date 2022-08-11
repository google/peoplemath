#!/bin/bash

set -e

(cd node_modules/dompurify && npx -p typescript tsc dist/*.js --declaration --allowJs --emitDeclarationOnly --outDir dist)

patch -u node_modules/dompurify/package.json -i dompurify.patch

