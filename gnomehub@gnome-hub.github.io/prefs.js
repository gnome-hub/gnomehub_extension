const { GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;
const Configuration = new Settings.Prefs();

const DEFAULT_SETTINGS = {
    isMemoryUsageEnable: true,
    memoryUsageText: 'M',
    refreshInterval: 1
};

const WIDGET_TEMPLATE_FILE = Gtk.get_major_version() === 3 ? 'prefs_gtk3.ui' : 'prefs.ui';

const gnomeHubPrefsWidget = GObject.registerClass({
    GTypeName: 'gnomeHubPrefsWidget',
    Template: Me.dir.get_child(WIDGET_TEMPLATE_FILE).get_uri(),
    InternalChildren: [
        'memory_usage_enable_switch',
        'refresh_interval'
    ]
}, class gnomeHubPrefsWidget extends Gtk.Box {
    _init() {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 30
        });

        this.update_widget_setting_values();
    }

    update_widget_setting_values() {
        this._memory_usage_enable_switch.set_active(Configuration.IS_MEMORY_USAGE_ENABLE.get());
        this._refresh_interval.set_value(Configuration.REFRESH_INTERVAL.get());
    }

    reset_settings_to_default() {
        Configuration.IS_MEMORY_USAGE_ENABLE.set(DEFAULT_SETTINGS.isMemoryUsageEnable);
        Configuration.REFRESH_INTERVAL.set(DEFAULT_SETTINGS.refreshInterval);
    }

    memory_usage_enable_switch_changed(widget) {
        Configuration.IS_MEMORY_USAGE_ENABLE.set(widget.get_active());
    }
    refresh_interval_changed(widget) {
        Configuration.REFRESH_INTERVAL.set(widget.get_value());
    }

    reset_settings_to_default_clicked(widget) {
        this.reset_settings_to_default();
        this.update_widget_setting_values();
    }
});

function init() { }

function buildPrefsWidget() {
    const widget = new gnomeHubPrefsWidget();
    widget.homogeneous = true;
    if (Gtk.get_major_version() === 3) {
        widget.show_all();
    }
    return widget;
}
