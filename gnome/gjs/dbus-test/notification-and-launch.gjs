#!/usr/bin/env gjs

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GioSubprocess = imports.gi.Gio.Subprocess;  // Required for launching processes

let proxy = null;

let loop = GLib.MainLoop.new(null, false);

// Watch for the Notifications service
Gio.DBus.session.watch_name('org.freedesktop.Notifications', Gio.BusNameWatcherFlags.NONE, (proxy, name, appeared) => {
    if (appeared) {
        print(`Service ${name} is now available!`);
        setupNotificationProxy();
        sendNotification();
    } else {
        print(`Service ${name} has disappeared!`);
    }
}, (proxy, name) => {
	print("Name vanished");
});

function setupNotificationProxy() {
    proxy = new Gio.DBusProxy.new_for_bus_sync(
        Gio.BusType.SESSION,
        Gio.DBusProxyFlags.NONE,
        null,
        'org.freedesktop.Notifications',
        '/org/freedesktop/Notifications',
        'org.freedesktop.Notifications',
        null
    );

    // Listen for "NotificationClosed" signal
    proxy.connect('g-signal', (proxy, sender_name, signal_name, parameters) => {
        if (signal_name === 'NotificationClosed') {
            let [id, reason] = parameters.recursiveUnpack();
            print(`Notification ${id} closed. Reason: ${reason}`);
        }
    });

    // Listen for "ActionInvoked" signal (when user clicks a button)
    proxy.connect('g-signal', (proxy, sender_name, signal_name, parameters) => {
        if (signal_name === 'ActionInvoked') {
            let [id, action_key] = parameters.recursiveUnpack();
            print(`Action "${action_key}" triggered on notification ${id}`);

            if (action_key === 'open_calculator') {
                launchCalculator();
            }
        }
    });
}

function sendNotification() {
    if (!proxy) return;

    let result = proxy.call_sync(
        'Notify',
        new GLib.Variant('(susssasa{sv}i)', [
            'MyApp',   // App name
            0,         // Notification ID (0 = new notification)
            'dialog-information',  // Icon name
            'Click to Open Calculator',   // Title
            'Press the button below to launch GNOME Calculator.',  // Body
            ['open_calculator', 'Open Calculator'],  // Actions: [Action Key, Button Label]
            {},        // Hints (empty)
            -1         // Expiration timeout (-1 = default)
        ]),
	    Gio.DBusProxyFlags.None,
        1000, null
    );

    let [notificationId] = result.recursiveUnpack();
    print(`Notification sent with ID: ${notificationId}`);
}

function launchCalculator() {
    print('Launching GNOME Calculator...');
    GioSubprocess.new(['gnome-calculator'], Gio.SubprocessFlags.NONE);
    loop.quit();
}

// Keep the script running to listen for events
//GLib.MainLoop.new(null, false).run();
loop.run();

