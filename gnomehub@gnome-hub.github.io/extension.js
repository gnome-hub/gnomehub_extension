const { GObject, St, Clutter, GLib, Gio, Soup } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MessageTray = imports.ui.messageTray;
const Mainloop = imports.mainloop;
const ByteArray = imports.byteArray;

const Tweener = imports.ui.tweener;

let text, button;
let originalCountUpdated, originalDestroy;
let iteration = 0;
let returnedForecast;
let indicator, uuid;

let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";

/* edit these values to customise the extension */
var lastCPUTotal;
var lastCPUUsed;
var numnotifications = 10; // change the max number of notifications to be displayed
var weatherCurrent = false;

// the following constants should be accesible to the user in a menu interface
const millisRefreshInterval = 1000;
const maxWidth = 500;
const textOffset = 20.0;

// notification modes: 0 = raw notifications
//                     1 = grouped mode
//                     2 = dropdown menu style // unimplemented
const notificationMode = 1;


const Dropdown = GObject.registerClass(
    class Dropdown extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'gnome-hub');
            // log("gnomehub: in indicator")
            let box = new St.BoxLayout({style_class:'extensionBox'});
            // can choose between icon or label
            this._label = new St.Label({
                'y_align' : Clutter.ActorAlign.CENTER,
                'text': 'Hub',
                'style_class': 'label'
            });
            box.add(this._label);
            box.add(PopupMenu.arrowIcon(St.Side.BOTTOM));
            this.actor.add_child(box);

            // declare variables
            // let systemBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            // let notiftitlebox = new St.BoxLayout({style_class: 'testclass'})
            let notifboxes = new Array(numnotifications);
            let notifLabels = new Array(numnotifications);
            // let cpuLabel = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START, y_expand=true});
            let cpuLabel = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START, translation_x: textOffset});
            let memLabel = new St.Label({text: '----', x_expand: true, x_align: Clutter.ActorAlign.START, translation_x: textOffset});

            for (let i = 0; i < numnotifications; i++) {
                notifboxes[i] = new St.BoxLayout({style_class: 'notificationBox' });
                notifLabels[i] = new St.Label({
                    text: '----', 
                    x_expand: true, 
                    x_align: Clutter.ActorAlign.START, 
                    y_align: Clutter.ActorAlign.CENTER,
                    translation_x: 2.0});
            }

            // update information
            function updateDisplay() {
                let notifications = [];
                if (notificationMode == 0) {
                    notifications = getNotifications();
                }
                else if (notificationMode == 1) {
                    notifications = getGroupedNotifications();
                }

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

                let cpuUsage = getCurrentCPUUsage();
                cpuLabel.set_text("CPU:\t"+cpuUsage+"%")
                
                let memUsage = getCurrentMemoryUsage();
                memLabel.set_text("MEM:\t"+memUsage+"%")
            }

            // actually add it to the menu bar
            // notifications section 
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem('Notifications'));

            this.add_child(box);
            // this.menu.box.add(notiftitlebox);
            for (let i = 0; i < 10; i++) {
                notifboxes[i].add(notifLabels[i]);
                this.menu.box.add(notifboxes[i]);
            }

            // add divider between sections
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem('Widgets'));
            /* widget section */
            //let WidgetMenuTitle = new PopupMenu.PopupMenuItem
            /* weather widget --> simplified */

            //var weatherWidget = new PopupMenu.PopupSubMenuMenuItem('Weather');
            /* TODO get API to constantly update using loop below */
            /*this.timer = Mainloop.timeout_add_seconds(30, Lang.bind(this, function() {
            log("Updating Weather");

            return true;
            }));
            */
            try{
                returnedForecast = _getWeather();
                let weatherText = returnedForecast['temperature']+"°"+returnedForecast['temperatureUnit'];
                //var weatherWidgetE = new PopupMenu.PopupMenuItem(weatherText);
                let weatherWidgetE = new St.BoxLayout({
                    style_class: 'weatherWidget'
                });
                let weatherWidgetInfo = new St.BoxLayout({
                    style_class: 'weatherWidgetInfo',
                    vertical: true,
                })
                let weatherWidgetLabel = new St.Label({
                    text: weatherText, 
                    x_expand: true, 
                    x_align: Clutter.ActorAlign.START, 
                    y_align: Clutter.ActorAlign.START,
                    translation_x: 2.0,
                    style_class: 'weatherTemperatureText'
                });
                let weatherWidgetDescription = new St.Label({
                    text: returnedForecast['detailedForecast'], 
                    x_expand: true, 
                    x_align: Clutter.ActorAlign.START, 
                    y_align: Clutter.ActorAlign.END,
                    translation_x: 2.0,
                    style_class: 'weatherDescriptionText',
                });
                weatherWidgetInfo.add(weatherWidgetLabel);
                weatherWidgetInfo.add(weatherWidgetDescription);
                let weatherWidgetPicture = new St.Icon({
                    style_class: 'weatherWidgetIcon',
                    icon_size: 90
                });
                let url = returnedForecast['icon'];
                let gicon = Gio.icon_new_for_string(url);
                weatherWidgetPicture.set_gicon(gicon);
                weatherWidgetE.add(weatherWidgetInfo);
                weatherWidgetE.add(weatherWidgetPicture);

                /*for(var weatherIndex = 0; weatherIndex < 5; weatherIndex++){
                var weatherText = new PopupMenu.PopupMenuItem('Forecast for ' + returnedForecast[weatherIndex]['name'] + ' in South Bend, IN:\n' + returnedForecast[weatherIndex]['detailedForecast']);
                weatherWidget.menu.addMenuItem(weatherText);
                }*/
                this.menu.box.add(weatherWidgetE);
            }
            catch (e) {
                log("error loading weather for weather widget")
            }
            /* end of weather widget */

            /* end of widget section */
            // add divider between sections
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem(''));
	    
            // settings section
            // let settingsMenuItem = new PopupMenu.PopupMenuItem('Settings');
            // settingsMenuItem.connect('activate', () => {
            //     ExtensionUtils.openPrefs();
            // });
            // this.menu.addMenuItem(settingsMenuItem); 
            
            // cpu and memory section
            this.menu.box.add(cpuLabel);
            this.menu.box.add(memLabel);

            
            // this._eventLoop = Mainloop.timeout_add(1000, Lang.bind(this, function (){
            //     updateDisplay();
            //     return true;
            // }))
            this._eventLoop = Mainloop.timeout_add(millisRefreshInterval, () => {
                updateDisplay();
                return true;
            })
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

// TODO: return this as a nice percent string instead of a decimal
const getCurrentCPUUsage = () => {
    let currentCPUUsage = 0;

    try {
        const inputFile = Gio.File.new_for_path('/proc/stat');
        const fileInputStream = inputFile.read(null);
        const dataInputStream = new Gio.DataInputStream({
            'base_stream': fileInputStream
        });

        let currentCPUUsed = 0;
        let currentCPUTotal = 0;
        let line = null;
        let length = 0;

        while (([line, length] = dataInputStream.read_line(null)) && line != null) {
            if (line instanceof Uint8Array) {
                line = ByteArray.toString(line).trim();
            } else {
                line = line.toString().trim();
            }

            const fields = line.split(/\W+/);

            if (fields.length < 2) {
                continue;
            }

            const itemName = fields[0];
            if (itemName == 'cpu' && fields.length >= 5) {
                const user = Number.parseInt(fields[1]);
                const system = Number.parseInt(fields[3]);
                const idle = Number.parseInt(fields[4]);
                currentCPUUsed = user + system;
                currentCPUTotal = user + system + idle;
                break;
            }
        }

        fileInputStream.close(null);

        // Avoid divide by zero
        if (currentCPUTotal - lastCPUTotal !== 0) {
            currentCPUUsage = (currentCPUUsed - lastCPUUsed) / (currentCPUTotal - lastCPUTotal);
        }

        lastCPUTotal = currentCPUTotal;
        lastCPUUsed = currentCPUUsed;
    } catch (e) {
        logError(e);
    }
    return parseInt(currentCPUUsage*100);
}

// TODO: return this as a nice percent string instead of a decimal
const getCurrentMemoryUsage = () => {
    let currentMemoryUsage = 0;

    try {
        const inputFile = Gio.File.new_for_path('/proc/meminfo');
        const fileInputStream = inputFile.read(null);
        const dataInputStream = new Gio.DataInputStream({
            'base_stream': fileInputStream
        });

        let memTotal = -1;
        let memAvailable = -1;
        let line = null;
        let length = 0;

        while (([line, length] = dataInputStream.read_line(null)) && line != null) {
            if (line instanceof Uint8Array) {
                line = ByteArray.toString(line).trim();
            } else {
                line = line.toString().trim();
            }

            const fields = line.split(/\W+/);

            if (fields.length < 2) {
                break;
            }

            const itemName = fields[0];
            const itemValue = Number.parseInt(fields[1]);

            if (itemName == 'MemTotal') {
                memTotal = itemValue;
            }

            if (itemName == 'MemAvailable') {
                memAvailable = itemValue;
            }

            if (memTotal !== -1 && memAvailable !== -1) {
                break;
            }
        }

        fileInputStream.close(null);

        if (memTotal !== -1 && memAvailable !== -1) {
            const memUsed = memTotal - memAvailable;
            currentMemoryUsage = memUsed / memTotal;
        }
    } catch (e) {
        logError(e);
    }
    return parseInt(currentMemoryUsage*100);
}

function updateMessageFile() {
    let sources = Main.messageTray.getSources();
    // log("XDG_RUNTIME_DIR") // TODO: use xdg/gnomehub
    let file = Gio.file_new_for_path(fname);
    let fstream = file.append_to(Gio.FileCreateFlags.NONE, null);

    // read from file
    let contents = [];
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
            contents.push(line)
        }

    } catch (e) {
        logError(e);
    }
    log(contents)
    
    
    // write things to file if not already written
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
            // let data = urg + " " + notif.title + " — " + notif.bannerBodyText;
            let data = notif.title + " — " + notif.bannerBodyText;
            data = data.replace("\n"," ");
            log("READ: "+data)
            if (contents.includes(data)) {
                continue;
            }
            else {
                data = data.replace("\\", "\\\\").replace("\n", "\\n") + "\n"
                // data = data.replace("\\", "\\\\") + "\n"
                fstream.write(data, null);
            }
        }
    }
    fstream.close(null);
}

function getGroupedNotifications() {
    updateMessageFile()
    // log("Gnomehub: in groupednotifications")
    let file = Gio.file_new_for_path(fname);
    let notifGroups = {};
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
            let [sender, notification] = line.split(" — ")
            if ("sender" in notifGroups) {
                notifGroups[sender].unshift(notification)
            }
            else {
                notifGroups[sender] = []
                notifGroups[sender].unshift(notification)
            }

            if (notifs.length > 10) {
                break;
            }
        }

    } catch (e) {
        logError(e);
    }

    for (var key in notifGroups) {
        // log("gnomehub most recent "+key+" notification: "+notifGroups[key][0])
        if (notifGroups[key][0]) {
            notifs.unshift(notifGroups[key][0])
        } 
        else {
            notifs.unshift("No subtext")
        }
        // log("gnomehub: "+key+": "+notifGroups[key])
    }

    return notifs
}

function getNotifications() {
    // log("File name: "+fname)
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

function _getWeather() {
    let forecast = [];

    let sessionSync = new Soup.SessionSync();
    let msg = Soup.Message.new('GET', 'https://api.weather.gov/gridpoints/IWX/29,63/forecast');
    msg.request_headers.append("User-Agent", "gnomehub/1.0");
    sessionSync.send_message(msg);
    let response = JSON.parse(msg.response_body.data);
    for(var index = 0; index < 5; index++){
        forecast.push({
            "name": response["properties"]["periods"][index]["name"],
            "temperature": response["properties"]["periods"][index]["temperature"],
            "detailedForecast": response["properties"]["periods"][index]["detailedForecast"],
            "temperatureUnit": response["properties"]["periods"][index]["temperatureUnit"],
            "icon": response["properties"]["periods"][index]["icon"],
        });
    }
    return(forecast[0]);
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
            // log("no log file already stored")
        }
        file.create(Gio.FileCreateFlags.NONE, null);

        this.indicator = new Dropdown();
        Main.panel.addToStatusArea(this.uuid, this.indicator, 0, 'right');

        originalCountUpdated = MessageTray.Source.prototype.countUpdated;
        MessageTray.Source.prototype.countUpdated = _countUpdated;
        // this.timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT_IDLE, 5, this._refresh_monitor.bind(this)); // REENABLE THIS FOR DEBUG
    }

    disable() {
        MessageTray.Source.prototype.countUpdated = originalCountUpdated;
        // this.indicator.destroy();
        Main.panel._rightBox.remove_child(button);
    }

    // _refresh_monitor() {
    //     let notifications = getNotifications();
    //     // log("Got:")
    //     // log(notifications)

    //     return GLib.SOURCE_CONTINUE;
    // }
}


function init(meta) {
    return new Extension(meta.uuid);
}
