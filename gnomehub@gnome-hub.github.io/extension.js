const { GObject, St, Clutter, GLib, Gio } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Dropdown = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'gnome-hub');
            log("gnomehub: in indicator")

            // can choose between icon or label
            this._label = new St.Label({
                'y_align' : Clutter.ActorAlign.CENTER,
                'text': 'gnomehub_placeholder',
                'style_class': 'label'
            });

            this.add_child(this._label);

            // Add an icon 
            /*
            this._icon = new St.Icon({
                gicon: new Gio.ThemedIcon({name: 'face-laugh-symbolic'}),
                style_class: 'system-status-icon'
            });
            this.add_child(this._icon);
            */

            // do for each item we want in the menu
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

/*
    enable() {
        log(`enabling ${Me.metadata.name}`);

        let indicatorName = `${Me.metadata.name} Indicator`;
        
        // Create a panel button
        //this._indicator = new PanelMenu.Button(0.0, indicatorName, false);
        this._indicator = new Dropdown();
        
        // Add an icon
        let icon = new St.Icon({
            gicon: new Gio.ThemedIcon({name: 'face-laugh-symbolic'}),
            style_class: 'system-status-icon'
        });
        this._indicator.add_child(icon);

        // `Main.panel` is the actual panel you see at the top of the screen,
        // not a class constructor.
        Main.panel.addToStatusArea(indicatorName, this._indicator);
    }
*/
    
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
