#!/usr/bin/env gjs

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const proxy = new Gio.DBusProxy.new_for_bus_sync(
	Gio.BusType.SESSION,
	Gio.DBusProxyFlags.NONE,
	null,
	'org.freedesktop.Notifications', // bus name
	'/org/freedesktop/Notifications', // object path
	'org.freedesktop.Notifications', // interface name
	null,
);

proxy.call_sync(
	'Notify', // method_name
	new GLib.Variant('(susssasa{sv}i)', // string unsigned string string string array string array dict {string, variant} signed
		[
			'MyApp', // string, App name
			0, // unassigned, Notification ID (0 = new notification)
			'dialog-information', // string, Icon name
			'Hello', // string, Summary (title)
			'This is a GJS D-Bus test', // sring, Body (message)
			[], // array string, Actions
			{}, // array {string variant}, Hints
			-1 // signed, Expiration timeout (-1 for default)
		],
	), // parameters
	Gio.DBusProxyFlags.None, // flags
	1000, // timeout_msec
	null, // cancellable
);

