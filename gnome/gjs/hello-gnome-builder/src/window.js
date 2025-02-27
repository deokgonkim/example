/* window.js
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
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { fetchData } from './main.js';

export const HelloWindow = GObject.registerClass({
    GTypeName: 'HelloWindow',
    Template: 'resource:///net/dgkim/gnome/Hello/window.ui',
    InternalChildren: ['label', 'label2'],
}, class HelloWindow extends Adw.ApplicationWindow {
    constructor(application) {
        super({ application });
        this.counter = 0;
    }

    clickLabel() {
        console.log('clickLabel of window');
        this.counter += 1;
        fetchData('https://www.dgkim.net/').then((response) => {
        // console.log('response', response);
            this._label2.set_label(`Hello!!${response.substring(0, 100)}`);
        }).catch((error) => {
            logError('got error', error);
        });

        const proc = Gio.Subprocess.new(
            ['ls', '-a'],
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
        );

        proc.communicate_utf8_async(null, null, (proc, res) => {
            try {
                const [result, stdout, stderr] = proc.communicate_utf8_finish(res);
                log('read stdout', stdout);
                log('read stderr', stderr);
            } catch(e) {
                logError(e);
            }
        });
    }
});

