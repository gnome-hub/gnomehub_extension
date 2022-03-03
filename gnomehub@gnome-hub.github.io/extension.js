const { GObject, St, Clutter, GLib, Gio, Soup } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MessageTray = imports.ui.messageTray;
const Mainloop = imports.mainloop;
const ByteArray = imports.byteArray;
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
let returnedForecast;
let indicator, uuid;

let weatherCurrent = false;

const Dropdown = GObject.registerClass(
    class Dropdown extends PanelMenu.Button {
        _init() {
            //this.weatherwidgetBox = new St.BoxLayout({style_class="weatherWidget",vertical:true});
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
            // call a function which returns a list of notifications with title and app name (that will replace list currently here)
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem('Notifications'));
            var notifications = _getNotifications()
            // var notifications = ['Test1','Test2','Test3']
            for(var i = 0;i < notifications.length;i++){
                let notifMenuItem = new PopupMenu.PopupMenuItem(notifications[i]);
                this.menu.addMenuItem(notifMenuItem);
            }
            let source = Main.messageTray.getSources()
            log(source.length)            
            
            // add divider between sections
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem('Widgets'));
            /* widget section */
           //let WidgetMenuTitle = new PopupMenu.PopupMenuItem
           /* weather widget --> simplified */
        
	    //var weatherWidget = new PopupMenu.PopupSubMenuMenuItem('Weather');
        var weatherText = "";
        /* TODO get API to constantly update using loop below */
           /*this.timer = Mainloop.timeout_add_seconds(30, Lang.bind(this, function() {
				log("Updating Weather");
                
				return true;
				}));
            */

        returnedForecast = _getWeather();
        weatherText = returnedForecast['name']+":"+returnedForecast['temperature']+returnedForecast['temperatureUnit'];
        var weatherWidgetE = new PopupMenu.PopupMenuItem(weatherText);

           /*for(var weatherIndex = 0; weatherIndex < 5; weatherIndex++){
	    	var weatherText = new PopupMenu.PopupMenuItem('Forecast for ' + returnedForecast[weatherIndex]['name'] + ' in South Bend, IN:\n' + returnedForecast[weatherIndex]['detailedForecast']);
	    	weatherWidget.menu.addMenuItem(weatherText);
	    }*/
	    this.menu.addMenuItem(weatherWidgetE);
            /* end of weather widget */
            /* end of widget section */

	    // add divider between sections
            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem('Settings'));
	    
            // settings section
            let settingsMenuItem = new PopupMenu.PopupMenuItem('System Stats');
            settingsMenuItem.connect('activate', () => {
                ExtensionUtils.openPrefs();
            });
            this.menu.addMenuItem(settingsMenuItem); 
        }

        setText(text) {
            return this._label.set_text(text);
        }
    }
)

function updateMessageFile() {
       let sources = Main.messageTray.getSources();
       log("XDG_RUNTIME_DIR") // TODO: use xdg/gnomehub
                              // TODO: store data in a json format - easier once we add cpu and memory metrics
       let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";
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

function _getNotifications() {
    // update notifications TODO: only read the lines necessary to display instead of the whole file
    let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";
    let file = Gio.file_new_for_path(fname);
    // try {
    //     const [, contents, etag] = file.load_contents(null);
    //     // log(contents.toString());
    //     log("GNOMEHUB: HERE")
    //     log(ByteArray.toString(contents))
    //     GLib.free(contents);
    // } catch (e) {
    //     log(e)
    // }

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
        log(line) // TODO: append line to an array and return that array
    }

    return []
}

function _getWeather() {
    let forecast = [];
    // await _getWeatherUri().then(uri => {
    //     let sessionSync = new Soup.SessionSync();
    //     let msg = Soup.Message.new('GET', uri);
    //     msg.request_headers.append("User-Agent", "Stackoverflow/1.0");
    //     sessionSync.send_message(msg);
    //     let response = JSON.parse(msg.response_body.data);
    //     forecast = {
    //         "name": response["properties"]["periods"][0]["name"],
    //         "temperature": response["properties"]["periods"][0]["temperature"],
    //         "detailedForecast": response["properties"]["periods"][0]["detailedForecast"],
    //     };
    // });

    let sessionSync = new Soup.SessionSync();
    let msg = Soup.Message.new('GET', 'https://api.weather.gov/gridpoints/IWX/29,63/forecast');
    msg.request_headers.append("User-Agent", "Stackoverflow/1.0");
    sessionSync.send_message(msg);
    let response = JSON.parse(msg.response_body.data);
    for(var index = 0; index < 5; index++){
        forecast.push({
            "name": response["properties"]["periods"][index]["name"],
            "temperature": response["properties"]["periods"][index]["temperature"],
            "detailedForecast": response["properties"]["periods"][index]["detailedForecast"],
            "temperatureUnit": response["properties"]["periods"][index]["temperatureUnit"],
        });
    }
    log("forecast:", JSON.stringify(forecast));
    
    return(forecast[0]);
}

function _getWeatherUri(){
    let sessionSync = new Soup.SessionSync();
    let msg = Soup.Message.new('GET', 'https://api.weather.gov/points/41.7003,-86.2386');
    msg.request_headers.append("User-Agent", "Stackoverflow/1.0");
    sessionSync.send_message(msg);
    let response = JSON.parse(msg.response_body.data);
    let uri = JSON.stringify(response["properties"]["forecast"])
    log("uri:", uri);
    return(uri);
}

function _countUpdated() {
       let res = originalCountUpdated.call(this);
       if(iteration%2 == 0) updateMessageFile();
       iteration = iteration + 1;
       return res;
}

function _destroy() {
       //let res = originalDestroy.call(this);

       //updateMessageFile();
       return res;
}

function init() {
    log(`initializing ${Me.metadata.name}`);
    
    indicator = null;
    uui = uuid;
    log("gnomehub: In enable")


    let fname = GLib.getenv("XDG_RUNTIME_DIR") + "/notifications";
    let file = Gio.file_new_for_path(fname);
   
    try {
        file.delete(null); //TODO: check if there is a file- if not no need to delete
    } catch (e) {
        log("no log file already stored")
    }
    file.create(Gio.FileCreateFlags.NONE, null);
}

function enable() {
       indicator = new Dropdown();
       log("gnomehub: In enable")
       Main.panel.addToStatusArea(uuid, indicator, 0, 'right');


       originalCountUpdated = MessageTray.Source.prototype.countUpdated;
       originalDestroy = MessageTray.Source.prototype.destroy;

       MessageTray.Source.prototype.countUpdated = _countUpdated;
       MessageTray.Source.prototype.destroy = _destroy;

       Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
       log(`disabling ${Me.metadata.name}`);

       indicator.destroy();
       indicator = null;

       Main.panel._rightBox.remove_child(button);


       MessageTray.Source.prototype.countUpdated = originalCountUpdated;
       MessageTray.Source.prototype.destroy = originalDestroy;

       Main.panel._rightBox.remove_child(button);
}
