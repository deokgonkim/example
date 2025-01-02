const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const BIND_ADDRESS = process.env.BIND_ADDRESS || '0.0.0.0:50051';
const PROTO_PATH = __dirname + '/../protos/helloworld.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const hello_proto = grpc.loadPackageDefinition(packageDefinition).grpc.example.helloworld;

const sayHello = async (call, callback) => {
    console.log('Received request:', call.request);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                message: `Hello ${call.request.name}`
            })
        }, 3000);
    }).then((result) => {
        callback(null, result);
    });
    // callback(null, { message: `Hello ${call.request.name}` });
    // return {
    //     message: `HELLO ${call.request.name}`
    // };
};

const main = () => {
    const server = new grpc.Server();
    server.addService(hello_proto.Hello.service, {
        hello: sayHello,
    });
    server.bindAsync(BIND_ADDRESS, grpc.ServerCredentials.createInsecure(), () => {
        // server.start(); // no longer required?
        console.log(`Server running at ${BIND_ADDRESS}`);
    });
}

if (require.main === module) {
    main();
}

module.exports = main;
module.exports.main = main;
