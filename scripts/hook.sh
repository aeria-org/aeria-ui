#!/bin/sh

UNDO=
ROOT="$(echo -n "$0" | sed -r 's/\/scripts\/([^$]+)//')"

function is_nested() {
  occurr="$(echo -n "$1" | tr '/' '\n' | grep -c 'node_modules')"
  [ $occurr -gt 1 ]
}

function replace_with_symlink() {
  origin="$1"
  target="$ROOT/$2"

  if [ -d "$origin" ]; then
    mv "$origin" "${origin}_bkp"
    ln -s "$target" "$origin"

    echo "$origin -> $target"
  fi
}

function revert_symlink() {
  origin="$1_bkp"
  target="$1"

  if [ -d "$origin" ]; then
    rm -rf "$target"
    mv "$origin" "$target"

    echo "$origin -> $target"
  fi
}

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

for d in $(find \( -type d -or -type l \) -name vue-router); do
  if is_nested "$d"; then
    continue
  fi

  if [ -n "$UNDO" ]; then
    revert_symlink "$d"
  else
    replace_with_symlink "$d" "node_modules/vue-router"
  fi

done

for d in $(find \( -type d -or -type l \) -name @aeria-ui); do
  if is_nested "$d"; then
    continue
  fi

  if [ -n "$UNDO" ]; then
    revert_symlink "$d/core"
    revert_symlink "$d/ui"
  else
    replace_with_symlink "$d/core" "packages/core"
    replace_with_symlink "$d/ui" "packages/ui"
  fi


done

