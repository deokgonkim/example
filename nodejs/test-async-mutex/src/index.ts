import { Mutex } from 'async-mutex';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mutex = new Mutex();

const helloer = async (counter: number) => {
    await sleep(Math.random() * 5000);
    console.log(`Hello world ${counter}`);
}

const main = async () => {
    console.log('before mutex');
    await Promise.all(Array.from({ length: 10 }, (_, i) => i).map(async (i) => {
        return helloer(i);
    }));

    console.log('using mutex');
    const mutexedHelloer = async (arg: number) => {
        return mutex.runExclusive(() => helloer(arg));
    };
    await Promise.all(Array.from({ length: 10 }, (_, i) => i).map(async (i) => {
        return mutexedHelloer(i);
    }));
}

main().catch(console.error);
