
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const MessageTray = imports.ui.messageTray;

let text, button;
let originalCountUpdated, originalDestroy;

function updateMessageFile() {
       let sources = Main.messageTray.getSources();
       log("XDG_RUNTIME_DIR")
       let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";
       log(fname)
       let file = Gio.file_new_for_path(fname);
       let fstream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);

       for (let i = 0; i < sources.length; i++) {
               for (let n = 0; n < sources[i].notifications.length; n++) {
                        let notif = sources[i].notifications[n];
                        let urg = "" + notif.urgency;
                        if (notif.urgency == 0) {
                            urg = "L"
                        } else if (notif.urgency == 1) {
                            urg = "N"
                        } else if (notif.urgency == 3) {
                            urg = "C"
                        }
                           let data = urg + " " + notif.title + " — " + notif.bannerBodyText;
                           data = data.replace("\\", "\\\\").replace("\n", "\\n") + "\n"
                           fstream.write(data, null, data.length);
                       }
              }

       fstream.close(null);
}

function _countUpdated() {
       let res = originalCountUpdated.call(this);

       updateMessageFile();
       return res;
}

function _destroy() {
       let res = originalDestroy.call(this);

       updateMessageFile();
       return res;
}

function init() {
}

function enable() {
       originalCountUpdated = MessageTray.Source.prototype.countUpdated;
       originalDestroy = MessageTray.Source.prototype.destroy;

       MessageTray.Source.prototype.countUpdated = _countUpdated;
       MessageTray.Source.prototype.destroy = _destroy;

       Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
       MessageTray.Source.prototype.countUpdated = originalCountUpdated;
       MessageTray.Source.prototype.destroy = originalDestroy;

       Main.panel._rightBox.remove_child(button);
}
