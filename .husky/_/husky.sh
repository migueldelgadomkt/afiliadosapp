#!/bin/sh
if [ -z "${husky_skip_init-}" ]; then
  debug () {
    [ "${HUSKY_DEBUG-}" = "1" ] && echo "husky (debug) - $1"
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -z "$HUSKY_SKIP_HOOKS" ]; then
    export husky_skip_init=1
    sh -e "$0" "$@"
    exitCode=$?
    unset husky_skip_init
    if [ $exitCode != 0 ]; then
      debug "hook exited with code $exitCode (error)"
    fi
    exit $exitCode
  else
    debug "HUSKY_SKIP_HOOKS is set, skipping hook"
  fi
fi
