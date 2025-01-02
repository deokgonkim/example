const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/../protos/helloworld.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const hello_proto = grpc.loadPackageDefinition(packageDefinition).grpc.example.helloworld;

const main = async () => {
    const argv = process.argv.slice(2);
    if (argv.length === 0) {
        console.log('Usage: node src/index.js <target> <name>');
        process.exit(1);
    }
    const target = argv[0];
    const name = argv[1];
    const client = new hello_proto.Hello(target, grpc.credentials.createInsecure());
    client.hello({ name }, (err, response) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(response);
        console.log(response.message);
    });
}

if (require.main === module) {
    main();
}

module.exports = main;
module.exports.main = main;
