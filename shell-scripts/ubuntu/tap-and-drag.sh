#!/bin/bash

export CURRENT=$(gsettings get org.gnome.desktop.peripherals.touchpad tap-and-drag)

if [ "$CURRENT" == "true" ]; then
gsettings set org.gnome.desktop.peripherals.touchpad tap-and-drag false
else
gsettings set org.gnome.desktop.peripherals.touchpad tap-and-drag true
fi

export NOW=$(gsettings get org.gnome.desktop.peripherals.touchpad tap-and-drag)

echo "tap-and-drag is now ${NOW}"
