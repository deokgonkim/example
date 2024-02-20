const { someFunction, SomeEntity, otherFunction } = require("provider");


const main = async () => {
    console.log("Hello");
    const result = someFunction("consumer");
    console.log('result', result);
    let a = new SomeEntity({
        name: "blabla",
    });

    console.log('a', a);

    console.log('b', otherFunction(a));
}

main().catch((err) => {
    console.error(err);
});
