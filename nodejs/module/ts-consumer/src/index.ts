import { SomeEntity, someFunction } from "provider";

export const main = async () => {
    const result = someFunction('abc');
    console.log('result', result);

    let someClass = new SomeEntity({
        name: "이름",
    });

    console.log('someClass', someClass);
}

main().catch((err) => {
    console.error(err);
});
