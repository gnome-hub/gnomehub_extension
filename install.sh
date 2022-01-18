#!/usr/bin/env bash

# copy extension to extensions folder and enable it
cp -r gnomehub@gnome-hub.github.io ~/.local/share/gnome-shell/extensions/
gnome-extensions enable gnomehub@gnome-hub.github.io

# restart gnome shell to reload the extensions
killall -SIGQUIT gnome-shell

