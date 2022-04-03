const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
// const Me = 

function init() {

}

function buildPrefsWidget() {
    let widget = new gnomeHubPrefsWidget();
    widget.show_all();
    return widget;
}

function getSettings() {
  let GioSSS = Gio.SettingsSchemaSource;
  let schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child("schemas").get_path(), // need to figure out how to get a path for Me
    GioSSS.get_default(),
    false
  );
  let schemaObj = schemaSource.lookup(
    'org.gnome.shell.extensions.gnomehub', true);
  if (!schemaObj) {
    throw new Error('cannot find schemas');
  }
  return new Gio.Settings({ settings_schema : schemaObj });
}

// settings.set_boolean('my-boolean', true);
const gnomeHubPrefsWidget = new GObject.Class({
    Name : "gnomeHub.Prefs.Widget",
    GTypeName : "gnomeHubPrefsWidget",
    Extends : Gtk.Box,

    _init : function (params) {
        let settings = getSettings(); 

        this.parent(params);
        this.margin = 20;
        this.set_spacing(15);
        this.set_orientation(Gtk.Orientation.VERTICAL);
        
        // for notifications
        let notifLabel = new Gtk.Label({
            label : "show notifications"
        });
        let notificationSwitch = new Gtk.ToggleButton();
        
        notificationSwitch.connect("toggled", function (w) {
            log( w.get_active() )
            settings.set_boolean('shownotifications', w.get_active());
        })

        let notifBox = new Gtk.Box();
        notifBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        notifBox.pack_start(notifLabel, false, false, 0);
        notifBox.pack_end(notificationSwitch, false, false, 0);
        this.add(notifBox);


        // for weather
        let weatherLabel = new Gtk.Label({
            label : "show weather"
        });
        let weatherSwitch = new Gtk.ToggleButton();
        
        weatherSwitch.connect("toggled", function (w) {
            log( w.get_active() )
        })

        let weatherBox = new Gtk.Box();
        weatherBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        weatherBox.pack_start(weatherLabel, false, false, 0);
        weatherBox.pack_end(weatherSwitch, false, false, 0);
        this.add(weatherBox);


        // for clipboard
        let clipboardLabel = new Gtk.Label({
            label : "show clipboard"
        });
        let clipboardSwitch = new Gtk.ToggleButton();
        
        clipboardSwitch.connect("toggled", function (w) {
            log( w.get_active() )
        })

        let clipBox = new Gtk.Box();
        clipBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        clipBox.pack_start(clipboardLabel, false, false, 0);
        clipBox.pack_end(clipboardSwitch, false, false, 0);
        this.add(clipBox);


        // for system stats
        let sysLabel = new Gtk.Label({
            label : "show notifications"
        });
        let sysSwitch = new Gtk.ToggleButton();
        
        sysSwitch.connect("toggled", function (w) {
            log( w.get_active() )
        })

        let sysBox = new Gtk.Box();
        sysBox.set_orientation(Gtk.Orientation.HORIZONTAL);
        sysBox.pack_start(sysLabel, false, false, 0);
        sysBox.pack_end(sysSwitch, false, false, 0);
        this.add(sysBox);
    }

})
