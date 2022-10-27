import './load-env.mjs';

import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const io = new Server({
    cors: {
        origin: 'http://localhost:8080'
    }
});

const pubClient = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then((results) => {
    io.adapter(createAdapter(pubClient, subClient));
    io.listen(3000);

    io.use(async (socket, next) => {
        console.log('Connected', socket.id);

        socket.on('disconnect', () => {
            console.log('disconnected', socket.id)
        });

        socket.on('join', (room) => {
            socket.join(room);
        })

        socket.on('message', function(topic, msg) {
            io.to(topic).emit('message', msg)
        });
        next();
    });

    setInterval(() => {
        io.to('test').emit('message', 'this is ping')
    }, 2000);
});
