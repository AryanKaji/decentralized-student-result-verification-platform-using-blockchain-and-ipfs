import { ethers } from "ethers";
import { abi } from "./abi";

// console.log("RPC:", process.env.RPC_URL);
// console.log("Contract:", process.env.CONTRACT_ADDRESS);

const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL
);

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    provider
);

// console.log("Wallet:", wallet.address);

export const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    abi,
    wallet
);

(async () => {
    try {
        console.log(await provider.getNetwork());

        const balance = await provider.getBalance(wallet.address);

        console.log("Balance:", ethers.formatEther(balance));
    } catch (e) {
        console.error(e);
    }
})();
