#!/usr/bin/env bash
# Writes storybook/index.html listing all deployed branch Storybooks (main first).
# Runs inside the gh-pages working tree.
set -euo pipefail

mkdir -p storybook
{
  cat << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Storybook Branches</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; }
    a { display: inline-block; padding: 10px 15px; background: #F0F0F0; text-decoration: none; border-radius: 5px; color: #333; }
    a:hover { background: #E0E0E0; }
    .main { background: #4CAF50; color: white; }
    .main:hover { background: #45A049; }
  </style>
</head>
<body>
  <h1>Available Storybook Builds</h1>
  <ul>
EOF
  if [ -d storybook/main ]; then
    echo '    <li><a class="main" href="./main/">main (latest)</a></li>'
  fi
  for dir in storybook/*/; do
    [ -d "$dir" ] || continue
    name=$(basename "$dir")
    if [ "$name" != "main" ]; then
      echo "    <li><a href=\"./$name/\">$name</a></li>"
    fi
  done
  echo "  </ul></body></html>"
} > storybook/index.html
