const { ApiPromise, WsProvider } = require('@polkadot/api');
const { 
    mnemonicGenerate, 
    mnemonicValidate 
} = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');
const BN = require('bn.js');

const connect = async () => {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944'); // local port
    const api = new ApiPromise({ provider: wsProvider });
    return api.isReady;
};

const keyring = new Keyring({type: 'sr25519'});

const FAUCET_11 = 'glass capable struggle cycle badge match until exotic hold paper steel wreck';

//Temporary Menu
console.log(`Create an Adress(1)`);
// Faucet included
console.log(`Sending coins via your Address(2)`); //ok
//console.log(`Transaction List for an Address(3)`);
//console.log(`Transaction Details for an Address(4)`); 
console.log(`Balance Control for an Address(3)`); //ok

const prompt = require("prompt-sync")();

const input = prompt("Enter your choice->");

console.log(`You selected ${input}`);


const main = async (api) => {
    console.log(`Our client is connected: ${api.isConnected}`);
    
    
    if(input==1){
    
        /*Phrase of Manuel Faucet*/
        const FAUCET_DenemeSon = 'knife uniform sign machine boring leopard bleak gym early fatal asthma differ';

        const createAccount = (mnemonic) => {
        mnemonic = mnemonic && mnemonicValidate(mnemonic) 
            ? mnemonic 
            : mnemonicGenerate();
        const account = keyring.addFromMnemonic(mnemonic);
        return { account, mnemonic };
    }
        const { account: m1 } = createAccount(FAUCET_DenemeSon);
        const { account: m2, mnemonic } = createAccount();

        console.log(`New account created with: "${mnemonic}"`);
        const balance = await api.derive.balances.all(m1.address);
        const available = balance.availableBalance;
        const decims = new BN(api.registry.chainDecimals);
        const factor = new BN(10).pow(decims);
        const amount = new BN(15).mul(factor);
        const transfer = api.tx.balances.transfer(m2.address, amount)
    
        const { partialFee } = await transfer.paymentInfo(m1);
        const fees = partialFee.muln(110).divn(100);
        
        const total = amount
            .add(fees)
            .add(api.consts.balances.existentialDeposit);
    
        if (total.gt(available)) {
            console.error(
                `Cannot transfer ${amount} with ${available} left`
            );
        }
        else {
            const tx = await transfer.signAndSend(m1);
            console.log(`Created transfer: ${tx}`);
        }
      

    }
    if(input==2){
        // a Sample address -> 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3
        const PHRASE = prompt("Enter your phrase given->")
        const reciever = prompt("Enter the adress of reciever->");
        const amount_send = prompt("Enter the amount->");

        //User activation    
        const sender = keyring.addFromUri(PHRASE);

        //transfer prepearition
        const transfer = api.tx.balances.transfer(reciever, amount_send);

        //Sign and Hash
        const hash = await transfer.signAndSend(sender);

        console.log('Transfer correctly sent and hash->', hash.toHex());
    }
    if(input==3){
        // const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
        const address = prompt("Enter your address->");

        const { data: { free } } = await api.query.system.account(address); // Get Balance ddd

        console.log(` ${address}  has a current balance of`, free.toHuman());

    }
    if(input==4){

        const signedBlock = await api.rpc.chain.getBlock();
        const allRecords = await api.query.system.events.at(signedBlock.block.header.hash);

        // map between the extrinsics and events
        signedBlock.block.extrinsics.forEach(({ method: { method, section } }, index) => {
        // filter the specific events based on the phase and then the
        // index of our extrinsic in the block
        const events = allRecords
            .filter(({ phase }) =>
            phase.isApplyExtrinsic &&
            phase.asApplyExtrinsic.eq(index)
            )
            .map(({ event }) => `${event.section}.${event.method}`);

        console.log(`${section}.${method}:: ${events.join(', ') || 'no events'}`);
});
}
    if(input==5){
      
    
    }
   
};

connect().then(main).catch((err) => {
    console.error(err)
}).finally(() => process.exit());