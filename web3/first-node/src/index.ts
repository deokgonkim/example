import Web3 from 'web3';

const INFURA_KEY = process.env.INFURA_KEY || 'your_infura_key_here';

// mainnet
const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_KEY}`);
// test sepolia
// const web3 = new Web3(`https://sepolia.infura.io/v3/${INFURA_KEY}`);

const getBalance = async (address: string) => {
    return web3.eth.getBalance(address);
}

const main = async () => {
    console.log("Hello");
    // const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Example address
    if (process.argv.length < 3) {
        console.error("Please provide an Ethereum address.");
        process.exit(1);
    }
    const address = process.argv[2];
    const balance = await getBalance(address);
    console.log(`Balance of ${address}: ${web3.utils.fromWei(balance, 'ether')} ETH`);
}

main().catch(console.error);
