const { GObject, St, Clutter, GLib, Gio } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MessageTray = imports.ui.messageTray;

const ByteArray = imports.byteArray;


//const St = imports.gi.St;
//const Gio = imports.gi.Gio;
//const GLib = imports.gi.GLib;
//const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
//const MessageTray = imports.ui.messageTray;

let text, button;
let originalCountUpdated, originalDestroy;
let iteration = 0;

let indicator, uuid;

let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";

const Dropdown = GObject.registerClass(
    class Dropdown extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'gnome-hub');
            log("gnomehub: in indicator")

            // can choose between icon or label
            this._label = new St.Label({
                'y_align' : Clutter.ActorAlign.CENTER,
                'text': 'Hub',
                'style_class': 'label'
            });

            this.add_child(this._label);
            
            //notifications section 
            var notifications = []

            // opening a known file and displaying the contents WORKS!
            for(var i = 0;i < notifications.length;i++){
                let notifMenuItem = new PopupMenu.PopupMenuItem(notifications[i]);
                this.menu.addMenuItem(notifMenuItem);
            }
            let source = Main.messageTray.getSources()
            log(source.length)            
            
            // add divider between sections
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem());
            
            // widgets section
            var widgetSection = new PopupMenu.PopupMenuItem('Widget');
            this.menu.addMenuItem(widgetSection);
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem());
            // settings section
            let settingsMenuItem = new PopupMenu.PopupMenuItem('Settings');
            settingsMenuItem.connect('activate', () => {
                ExtensionUtils.openPrefs();
            });
            this.menu.addMenuItem(settingsMenuItem); 
        }

        setText(text) {
            return this._label.set_text(text);
        }

        updateDisplay(notifications) {
            // var notifications = _getNotifications()
            for (let i = 0; i < notifications.length; i++) {
                var notifMenuItem = new PopupMenu.PopupMenuItem(notifications[i]);
                this.menu.addMenuItem(notifMenuItem);
            }
        }


    }
)

function updateMessageFile() {
       let sources = Main.messageTray.getSources();
       // log("XDG_RUNTIME_DIR") // TODO: use xdg/gnomehub
                              // TODO: store data in a json format - easier once we add cpu and memory metrics
       let file = Gio.file_new_for_path(fname);
       let fstream = file.append_to(Gio.FileCreateFlags.NONE, null);
       //let fstream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
/*
       const ioStream = file.open_readwrite(null);
       const outStream = ioStream.get_output_stream;
*/
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
                           fstream.write(data, null, data.length); // TODO: figure out which argument is unnecessary- there is a warning that there are too many arguments to this method
                       }
              }
       fstream.close(null);
}

function getNotifications() {
    let file = Gio.file_new_for_path(fname);
    let notifs = [];

    // update notifications TODO: only read the lines necessary to display instead of the whole file
    try {
        const fileInputStream = file.read(null);
        const dataInputStream = new Gio.DataInputStream({
            'base_stream' : fileInputStream
        });

        while (([line, length] = dataInputStream.read_line(null)) && line != null) {
            if (line instanceof Uint8Array) {
                line = ByteArray.toString(line).trim();
            }
            else {
                line = line.toString().trim();
            }
            log(line)
            // notifs.push(line)
        }

    } catch (e) {
        logError(e);
    }

    return notifs
}

function _countUpdated() {
    let res = originalCountUpdated.call(this);
    if(iteration%2 == 0) {
        updateMessageFile();
    } 
    iteration = iteration + 1;
    return res;
}

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this.indicator = null;

        let file = Gio.file_new_for_path(fname);
        try {
            file.delete(null); //TODO: check if there is a file- if not no need to delete
        } catch (e) {
            log("no log file already stored")
        }
        file.create(Gio.FileCreateFlags.NONE, null);

        this.indicator = new Dropdown();
        Main.panel.addToStatusArea(this.uuid, this.indicator, 0, 'right');

        originalCountUpdated = MessageTray.Source.prototype.countUpdated;
        MessageTray.Source.prototype.countUpdated = _countUpdated;
        // this.timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT_IDLE, 1, this._refresh_monitor.bind(this));

        Main.panel._rightBox.insert_child_at_index(button, 0);
    }

    disable() {
        this.indicator = null;
        Main.panel._rightBox.remove_child(button);
    }
}
// function _destroy() {
//        let res = originalDestroy.call(this);

//        //updateMessageFile();
//        return res;
// }

// function init() {
//     log(`initializing ${Me.metadata.name}`);
    
//     indicator = null;
//     uui = uuid;
//     log("gnomehub: In enable")


//     let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";
//     let file = Gio.file_new_for_path(fname);
   
//     try {
//         file.delete(null); //TODO: check if there is a file- if not no need to delete
//     } catch (e) {
//         log("no log file already stored")
//     }
//     file.create(Gio.FileCreateFlags.NONE, null);
    
// }

// function enable() {
//        indicator = new Dropdown();
//        log("gnomehub: In enable")
//        Main.panel.addToStatusArea(uuid, indicator, 0, 'right');


//        originalCountUpdated = MessageTray.Source.prototype.countUpdated;
//        originalGetNotifications = MessageTray.Source.prototype.getNotifications;
//        originalDestroy = MessageTray.Source.prototype.destroy;

//        MessageTray.Source.prototype.countUpdated = _countUpdated;
//        MessageTray.Source.prototype.getNotifications = _getNotifications;
//        MessageTray.Source.prototype.destroy = _destroy;

//        Main.panel._rightBox.insert_child_at_index(button, 0);
// }

// function disable() {
//        log(`disabling ${Me.metadata.name}`);

//        // indicator.destroy();
//        indicator = null;

//        Main.panel._rightBox.remove_child(button);


//        MessageTray.Source.prototype.countUpdated = originalCountUpdated;
//        MessageTray.Source.prototype.getNotifications = originalGetNotifications;
//        MessageTray.Source.prototype.destroy = originalDestroy;

//        Main.panel._rightBox.remove_child(button);
// }
function init(meta) {
    return new Extension(meta.uuid);
}
