const { someFunction, SomeEntity, otherFunction, ClassEntity } = require("provider");


const main = async () => {
    console.log("Hello");
    const result = someFunction("consumer");
    console.log('result', result);
    let a = new SomeEntity({
        name: "blabla",
    });

    console.log('a', a);

    console.log('b', otherFunction(a));

    let newClass = new ClassEntity({
        name: "하하하",
    });
    console.log('newClass', newClass);
}

main().catch((err) => {
    console.error(err);
});
