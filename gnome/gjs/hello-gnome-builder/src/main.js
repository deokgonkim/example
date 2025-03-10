/* main.js
 *
 * Copyright 2024 dgkim
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';
import Soup from 'gi://Soup';

const byteArray = imports.byteArray;

import { HelloWindow } from './window.js';

pkg.initGettext();
pkg.initFormat();


export async function fetchData(url) {
    return new Promise((resolve, reject) => {
        let session = new Soup.Session();
        let message = new Soup.Message({ method: 'GET', uri: GLib.Uri.parse(url, null) });
        console.log('prepared message');
        session.send_async(message, null, null, (session, result) => {
            try {
            console.log('in callback');
                let stream = session.send_finish(result);

                stream.read_bytes_async(4096, null, null, (inputStream, res) => {
                    let data;

                    try {
                        data = inputStream.read_bytes_finish(res);
                        const stringResponse = byteArray.toString(byteArray.fromGBytes(data))
                        resolve(stringResponse);
                    } catch (e) {
                        logError(e);
                        reject(e);
                    } finally {
                        // log(`body:\n${byteArray.toString(byteArray.fromGBytes(data))}`);
                    }
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    });
}

export const HelloApplication = GObject.registerClass(
    class HelloApplication extends Adw.Application {
        constructor() {
            super({application_id: 'net.dgkim.gnome.Hello', flags: Gio.ApplicationFlags.DEFAULT_FLAGS});

            const quit_action = new Gio.SimpleAction({name: 'quit'});
                quit_action.connect('activate', action => {
                this.quit();
            });
            this.add_action(quit_action);
            this.set_accels_for_action('app.quit', ['<primary>q']);

            const show_about_action = new Gio.SimpleAction({name: 'about'});
            show_about_action.connect('activate', action => {
                let aboutParams = {
                    transient_for: this.active_window,
                    application_name: 'hello',
                    application_icon: 'net.dgkim.gnome.Hello',
                    developer_name: 'dgkim',
                    version: '0.1.0',
                    developers: [
                        'dgkim'
                    ],
                    copyright: '© 2024 dgkim'
                };
                const aboutWindow = new Adw.AboutWindow(aboutParams);
                aboutWindow.present();
            });
            this.add_action(show_about_action);
        }

        vfunc_activate() {
            let {active_window} = this;

            if (!active_window)
                active_window = new HelloWindow(this);

            active_window.present();
        }
    }
);

export function main(argv) {
    const application = new HelloApplication();
    return application.runAsync(argv);
}
