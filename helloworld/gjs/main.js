#!/usr/bin/gjs

imports.gi.versions.Gtk = "4.0";

const { Gtk } = imports.gi;

const app = new Gtk.Application({
    application_id: "com.example.helloworld",
});

app.connect("activate", () => {
    const window = new Gtk.ApplicationWindow({
        application: app,
        title: "Hello World",
        default_width: 320,
        default_height: 160,
    });

    const label = new Gtk.Label({
        label: "Hello, world!",
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
    });

    window.set_child(label);
    window.present();
});

app.run([]);
