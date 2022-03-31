#!/usr/bin/env bash

# make a zip file
zip -r gnomehub@gnome-hub.github.io.zip gnomehub@gnome-hub.github.io/*

# copy extension to extensions folder and enable it
gnome-extensions disable gnomehub@gnome-hub.github.io
rm -rf ~/.local/share/gnome-shell/extensions/gnomehub@gnome-hub.github.io
cp -r gnomehub@gnome-hub.github.io ~/.local/share/gnome-shell/extensions/
gnome-extensions enable gnomehub@gnome-hub.github.io

# restart gnome shell to reload the extensions
if [[ -v $WAYLAND_DISPLAY ]];
then
    echo "wayland detected"
    dbus-run-session -- gnome-shell --nested --wayland
else
    echo "x11 detected"
    killall -SIGQUIT gnome-shell
fi

