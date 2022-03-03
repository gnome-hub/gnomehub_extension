const { GObject, St, Clutter, GLib, Gio } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MessageTray = imports.ui.messageTray;

const ByteArray = imports.byteArray;

const Mainloop = imports.mainloop;
const Lang = imports.lang;

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
            
            
            let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            let systemBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            let notiftitlebox = new St.BoxLayout({ height: 25.0, style_class: 'popup-status-menu-box' });
            let notifboxes = new Array(10);
            let notifLabels = new Array(10);
            // let cpuLabel = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START, y_expand=true});
            let cpuLabel = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START});
            let memLabel = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START});

            for (let i = 0; i < 10; i++) {
                notifboxes[i] = new St.BoxLayout({ height: 25.0, style_class: 'popup-status-menu-box' });
                notifLabels[i] = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START, translation_x: 2.0});
            }

            function updateDisplay() {
                let notifications = getNotifications();
                // log(notifications.length)
                let i = 0;
                while (i < 10 && i < notifications.length) {
                    notifLabels[i].set_text(notifications[i]);
                    i = i + 1;
                }
                for (let i = 0; i < 10; i++) {
                    if (i < notifications.length) {
                        notifLabels[i].set_text(notifications[i])
                    }
                    else {
                        notifLabels[i].set_text("----")
                    }
                }
                

                let cpuUsage = getCPU();
                cpuLabel.set_text("CPU: "+cpuUsage)
                
                let memUsage = getMem();
                memLabel.set_text("MEM: "+memUsage)
            }

            box.add_child(this._label);
            this.add_child(box);
            this.menu.box.add(notiftitlebox);
            for (let i = 0; i < 10; i++) {
                notifboxes[i].add(notifLabels[i]);
                this.menu.box.add(notifboxes[i]);
            }

            // add divider between sections
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem());
            
            // widgets section
            var widgetSection = new PopupMenu.PopupMenuItem('Widget');
            this.menu.addMenuItem(widgetSection);
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem());
            // settings section
            // let settingsMenuItem = new PopupMenu.PopupMenuItem('Settings');
            // settingsMenuItem.connect('activate', () => {
            //     ExtensionUtils.openPrefs();
            // });
            // this.menu.addMenuItem(settingsMenuItem); 
            
            // cpu and memory section
            this.menu.box.add(cpuLabel);
            this.menu.box.add(memLabel);

            
            this._eventLoop = Mainloop.timeout_add(1000, Lang.bind(this, function (){
                updateDisplay();
                return true;
            }))
        }

        // setText(text) {
        //     return this._label.set_text(text);
        // }

        _onDestroy() {
            Mainloop.source_remove(this._eventLoop);
            this.menu.removeAll();
            super._onDestroy();
        }


    }
)

function getCPU() {
    return 74.04;
}

function getMem() {
    return 26.4;
}

function updateMessageFile() {
       let sources = Main.messageTray.getSources();
       // log("XDG_RUNTIME_DIR") // TODO: use xdg/gnomehub
       let file = Gio.file_new_for_path(fname);
       let fstream = file.append_to(Gio.FileCreateFlags.NONE, null);

       // TODO: make it store in a string we would actually want to display
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
                           fstream.write(data, null);
                       }
              }
       fstream.close(null);
}

function getNotifications() {
    log("File name: "+fname)
    let file = Gio.file_new_for_path(fname);
    let notifs = [];

    try {
        const fileInputStream = file.read(null);
        const dataInputStream = new Gio.DataInputStream({
            'base_stream' : fileInputStream
        });
        var line;

        while (([line, length] = dataInputStream.read_line(null)) && line != null) {
            if (line instanceof Uint8Array) {
                line = ByteArray.toString(line).trim();
            }
            else {
                line = line.toString().trim();
            }
            notifs.unshift(line) // use stack to push to top

            if (notifs.length > 10) {
                break;
            }
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
        this.timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT_IDLE, 5, this._refresh_monitor.bind(this)); // REENABLE THIS

        // Main.panel._rightBox.insert_child_at_index(button, 0);
    }

    disable() {
        this.indicator = null;
        Main.panel._rightBox.remove_child(button);
    }

    _refresh_monitor() {
        // fetch
        let notifications = getNotifications();
        log("Got:")
        log(notifications)
        // set
        // this.indicator.updateDisplay();
        // this.indicator = null; // not working :(
        // this.indicator = new Dropdown();
        // enable();
        // return
        return GLib.SOURCE_CONTINUE;
    }
}



function init(meta) {
    return new Extension(meta.uuid);
}
