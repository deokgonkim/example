#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Fetch Slack channel messages with curl.

Usage:
  scripts/fetch-messages.sh CHANNEL_OR_NAME [LIMIT]

Environment:
  SLACK_USER_TOKEN   Required. Slack user token, for example xoxp-...
  SLACK_API_BASE_URL Optional. Defaults to https://slack.com/api
  CURSOR             Optional. Pagination cursor
  OLDEST             Optional. Oldest message timestamp filter
  LATEST             Optional. Latest message timestamp filter
  INCLUSIVE          Optional. true or false, defaults to true

Examples:
  SLACK_USER_TOKEN=xoxp-... scripts/fetch-messages.sh C0123456789
  SLACK_USER_TOKEN=xoxp-... scripts/fetch-messages.sh general
  SLACK_USER_TOKEN=xoxp-... CURSOR=dXNlcjpVMEc5V0ZYTlo scripts/fetch-messages.sh general 100
EOF
}

require_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required for channel name resolution" >&2
    exit 1
  fi
}

slack_get() {
  local endpoint="$1"
  shift

  curl \
    --silent \
    --show-error \
    --fail-with-body \
    --get \
    --url "${SLACK_API_BASE_URL%/}/${endpoint}" \
    --header "Authorization: Bearer ${SLACK_USER_TOKEN}" \
    "$@"
}

resolve_channel_id() {
  local input="$1"
  local normalized="${input#\#}"
  local cursor=""
  local response=""
  local found_id=""
  local ok=""

  if [[ "$normalized" =~ ^[CGD][A-Z0-9]{8,}$ ]]; then
    printf '%s\n' "$normalized"
    return 0
  fi

  require_jq

  while :; do
    if [[ -n "$cursor" ]]; then
      response="$(slack_get "conversations.list" \
        --data-urlencode "limit=200" \
        --data-urlencode "exclude_archived=true" \
        --data-urlencode "types=public_channel,private_channel" \
        --data-urlencode "cursor=${cursor}")"
    else
      response="$(slack_get "conversations.list" \
        --data-urlencode "limit=200" \
        --data-urlencode "exclude_archived=true" \
        --data-urlencode "types=public_channel,private_channel")"
    fi

    ok="$(jq -r '.ok' <<<"$response")"
    if [[ "$ok" != "true" ]]; then
      jq -r '.error // "Slack API error"' <<<"$response" >&2
      exit 1
    fi

    found_id="$(jq -r --arg name "$normalized" '.channels[]? | select(.name == $name) | .id' <<<"$response" | head -n 1)"
    if [[ -n "$found_id" ]]; then
      printf '%s\n' "$found_id"
      return 0
    fi

    cursor="$(jq -r '.response_metadata.next_cursor // empty' <<<"$response")"
    if [[ -z "$cursor" ]]; then
      break
    fi
  done

  echo "Channel not found: ${normalized}" >&2
  exit 1
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 1
fi

if [[ -z "${SLACK_USER_TOKEN:-}" ]]; then
  echo "SLACK_USER_TOKEN is required" >&2
  exit 1
fi

CHANNEL_INPUT="$1"
LIMIT="${2:-50}"
SLACK_API_BASE_URL="${SLACK_API_BASE_URL:-https://slack.com/api}"
INCLUSIVE="${INCLUSIVE:-true}"

if ! [[ "$LIMIT" =~ ^[0-9]+$ ]]; then
  echo "LIMIT must be an integer" >&2
  exit 1
fi

CHANNEL_ID="$(resolve_channel_id "$CHANNEL_INPUT")"

curl_args=(
  --data-urlencode "channel=${CHANNEL_ID}"
  --data-urlencode "limit=${LIMIT}"
  --data-urlencode "inclusive=${INCLUSIVE}"
)

if [[ -n "${CURSOR:-}" ]]; then
  curl_args+=(--data-urlencode "cursor=${CURSOR}")
fi

if [[ -n "${OLDEST:-}" ]]; then
  curl_args+=(--data-urlencode "oldest=${OLDEST}")
fi

if [[ -n "${LATEST:-}" ]]; then
  curl_args+=(--data-urlencode "latest=${LATEST}")
fi

slack_get "conversations.history" "${curl_args[@]}"
