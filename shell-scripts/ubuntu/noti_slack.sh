#!/bin/bash
#
# This script is used to notify system admin when user accesses this server via ssh session
#
# Usage
#
# 1. Create slack access token according to slack documentation.
# 2. Update `SLACK_TOKEN` and `SLACK_CHANNEL`
# 1. Copy this script as `/etc/pam.scripts/noti_slack.sh`
# 2. Add following line at the bottom of `/etc/pam.d/sshd` (of course, without backtick ```)
# ```
# session required pam_exec.sh /etc/pam.scripts/noti_slack.sh
# ```
#

SLACK_URL=https://slack.com/api/chat.postMessage

# https://api.slack.com/apps/[APP_ID_REDACTED]/oauth?
SLACK_TOKEN="xoxb-[redacted]-[redacted]-[redacted]"
SLACK_CHANNEL=general


NOW=$(date '+%Y-%m-%d %H:%M:%S')
#SYS_INFO=$(uname -snrmo)
SYS_INFO=$(uname -mo)

PAYLOAD=$(cat <<EOF
{
  "channel": "$SLACK_CHANNEL",
  "text": "🔐 ${HOSTNAME} *SSH Login Notification*",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*${HOSTNAME}* | New SSH login detected"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*User:* \`$PAM_USER\`" },
        { "type": "mrkdwn", "text": "*Source IP:* \`$PAM_RHOST\`" },
        { "type": "mrkdwn", "text": "*Service:* \`$PAM_SERVICE\`" },
        { "type": "mrkdwn", "text": "*TTY:* \`$PAM_TTY\`" }
      ]
    },
    {
      "type": "context",
      "elements": [
        { "type": "mrkdwn", "text": "📅 *Time:* $NOW  |  💻 *System:* $SYS_INFO" }
      ]
    }
  ]
}
EOF
)

if [ "x${PAM_TYPE}" = "xopen_session" ]; then
	curl -H "Content-Type: application/json" -H "Authorization: Bearer ${SLACK_TOKEN}" -X POST $SLACK_URL -d"$PAYLOAD"
fi

exit 0

