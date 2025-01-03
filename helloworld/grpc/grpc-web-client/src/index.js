const helloworld = require('./generated/helloworld_grpc_web_pb.js');

const helloHttpEndpoint = 'http://localhost:8080';

const helloer = async (name) => {
    return new Promise((resolve) => {
        const client = new helloworld.HelloClient(helloHttpEndpoint, null, null);
        
        const request = new helloworld.HelloRequest();
        request.setName(name);
        
        client.hello(request, {}, (err, response) => {
            if (err) {
                console.error(err);
                throw err;
            } else {
                console.log(response.getMessage());
                resolve(response.getMessage());
            }
        });
    })
}

const main = async () => {
    return helloer('World');
}

main().catch(console.error);

// to expose the main function to the browser
if (typeof window !== 'undefined') {
    window.main = main;
    window.helloer = helloer;
}
