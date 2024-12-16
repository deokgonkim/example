imports.gi.versions.Gtk = "3.0";

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;

Gtk.init(null);

const Clock = new Lang.Class({
  Name: 'Clock',

  _init: function() {
    this.window = new Gtk.Window({ type: Gtk.WindowType.TOPLEVEL });
    this.window.set_title('Clock');
    this.window.set_default_size(200, 100);
    this.window.connect('destroy', Gtk.main_quit);

    this.label = new Gtk.Label();
    this.label.set_text(this.getCurrentTime());

    this.window.add(this.label);
    this.window.show_all();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, Lang.bind(this, this.updateClock));
  },

  getCurrentTime: function() {
    let now = new Date();
    return now.toLocaleTimeString();
  },

  updateClock: function() {
    this.label.set_text(this.getCurrentTime());
    return true;
  }
});

let clock = new Clock();
Gtk.main();
/* 출처: https://blog.pages.kr/2730 [pages.kr 날으는물고기 <º))))><:티스토리] */
