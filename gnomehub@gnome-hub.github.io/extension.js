const { GObject, St, Clutter, GLib, Gio } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;


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
            // call a function which returns a list of notifications with title and app name (that will replace list currently here)
            var notifications = ['Test1','Test2','Test3']
            for(var i = 0;i < notifications.length;i++){
                let notifMenuItem = new PopupMenu.PopupMenuItem(notifications[i]);
                this.menu.addMenuItem(notifMenuItem);
            }
            //let source = Main.messageTray.getSources()
            //let applicationIndex = this.appBlackList.indexOf(source[source.length-1].title);
            //log(applicationIndex);
            
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
    }
)

class Extension {
    constructor(uuid) {
        this._indicator = null;
        this._uui = uuid
        log("gnomehub: In constructor")
    }

    enable() {
        this._indicator = new Dropdown();
        log("gnomehub: In enable")
        Main.panel.addToStatusArea(this._uuid, this._indicator, 0, 'right');
    }
    
    // REMINDER: It's required for extensions to clean up after themselves when
    // they are disabled. This is required for approval during review!
    disable() {
        log(`disabling ${Me.metadata.name}`);

        this._indicator.destroy();
        this._indicator = null;
    }
}

function init() {
    log(`initializing ${Me.metadata.name}`);
    
    return new Extension();
}


/*
const {St, Clutter} = imports.gi;
const Main = imports.ui.main;

let panelButton;

function init () {
    panelButton = new St.Bin({
        style_class : "panel-button",
    });

    let panelButtonText = new St.label({
        text : "Hello World",
        y_align: Clutter.ActorAlign.CENTER,
    });

    panelButton.set_child(panelButtonText);
}

function enable () {
    Main.panel._rightBox.insert_child_at_index(panelButton, 0);
}

function disable () {
    Main.panel._rightBox.remove_child(panelButton);
}
*/
