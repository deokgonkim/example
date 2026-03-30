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


PAYLOAD=$(echo "
{
    \"channel\": \"$SLACK_CHANNEL\",
    \"text\": \"${PAM_USER} is trying to access ssh on ${HOSTNAME}\n
A SSH login was successful, so here are some information for security:\n
User:        $PAM_USER\n
User IP Host: $PAM_RHOST\n
Service:     $PAM_SERVICE\n
TTY:         $PAM_TTY\n
Date:        `date`\n
Server:      `uname -a`\"
}
" | tr '\n' ' ')

if [ "x${PAM_TYPE}" = "xopen_session" ]; then
	curl -H "Content-Type: application/json" -H "Authorization: Bearer ${SLACK_TOKEN}" -X POST $SLACK_URL -d"$PAYLOAD"
fi

exit 0

