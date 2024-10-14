#!/bin/bash

# In ubuntu 24.04,
# The `Super+.` key is bind to be used as emoji input.
# And the vscode also requires `Super+.` as quick problem fix key.
# So, this script removes <Super>period hotkey from gsettings.

# set <Super>semicolon as emoji hotkey
gsettings set org.freedesktop.ibus.panel.emoji hotkey "['<Super>semicolon']"

# following command will reset to default setting
#gsettings reset org.freedesktop.ibus.panel.emoji hotkey

# displays setting
gsettings get org.freedesktop.ibus.panel.emoji hotkey

