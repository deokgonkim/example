#!/usr/bin/env gjs

imports.gi.versions.Soup = "3.0";

//import Soup from 'gi://Soup';
const Soup = imports.gi.Soup;
//import GLib from 'gi://GLib';
const GLib = imports.gi.GLib;
const byteArray = imports.byteArray;

const loop = GLib.MainLoop.new(null, false);

function read_bytes_async_callback(inputStream, res) {
    let data;

    try {
        data = inputStream.read_bytes_finish(res);
        return data;
    } catch (e) {
        logError(e);
        return;
    } finally {
    log(`body:\n${byteArray.toString(byteArray.fromGBytes(data))}`);
    }
}


async function fetchData(url) {
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
                        log(`body:\n${byteArray.toString(byteArray.fromGBytes(data))}`);
                    }
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    });
}

console.log('Begin');

fetchData('https://public-api-dev.dgkim.net/version').then((result) => {
    console.log('Fetched');
    console.log(result);
}).catch((err) => {
    console.log('Error');
    console.error(err);
});

loop.run();
