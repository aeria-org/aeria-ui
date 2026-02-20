#!/bin/sh

UNDO=
ROOT="$(echo -n "$0" | sed -r 's/\/scripts\/([^$]+)//')"

while getopts "hu" arg; do
  case "$arg" in
    h)
      echo "to hook a project: $0"
      echo "to undo: $0 -u"
      ;;
    u)
      UNDO=1
      echo "undoing..."
      ;;
  esac
done

function is_nested() {
  occurr="$(echo -n "$1" | tr '/' '\n' | grep -c 'node_modules')"
  [ $occurr -gt 1 ]
}

function replace_dirs() {
  if ! [ -d "$1" ] || is_nested "$1"; then
    return 0
  fi

  if [ -n "$UNDO" ]; then
    origin="$1_bkp"
    target="$1"

    rm -rf "$target"
    mv "$origin" "$target"

  else
    origin="$1"
    target="$ROOT/$2"

    if [ -d "$origin" ]; then
      mv "$origin" "${origin}_bkp"
      ln -s "$target" "$origin"
    fi
  fi

  echo "$origin -> $target"
}

for d in $(find \( -type d -or -type l \) -name vue-router); do
  replace_dirs "$d" "node_modules/vue-router"
done

for d in $(find \( -type d -or -type l \) -name aeria-app-layout); do
  replace_dirs "$d" "layouts/aeria-app-layout"
done

for d in $(find \( -type d -or -type l \) -name @aeria-ui); do
  replace_dirs "$d/core" "packages/core"
  replace_dirs "$d/ui" "packages/ui"
done

