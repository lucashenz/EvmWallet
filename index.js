require("dotenv").config()

const SYMBOL = process.env.SYMBOL

const WalletService = require("./WalletService");
const readLine = require('readline');
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})


let myAddress = null;

function menu(){
    setTimeout(() => {
        
    
    console.clear();
    console.log("Seja bem-vindo a evm wallet @lucasberselihenz");
    console.log("");

    if (myAddress) {
        console.log("Endereço da carteira: " + myAddress);
    } else { 
        console.log("Você ainda não possui uma carteira.");
    }
    console.log("1. Create a new wallet");
    console.log("2. Recover a wallet");
    console.log("3. Balance");
    console.log("4. Send " + SYMBOL);
    console.log("5. Search TX");
    rl.question("Escolha uma opção: ", (option) => {
        switch(option) {
            case '1':
                console.log("Criando uma nova carteira...");
                CreateWallet();
                break;
            case '2':
                console.log("Recuperando uma carteira...");
                recoverWallet();
                break;
            case '3':
                console.log("Verificando saldo...");
                getBalance();
                break;
            case '4':
                console.log("Enviando...");
                sendTx();
                break;
            case '5':
                console.log("Procurando transação...");
                searchTx();
                break;
            default:
                console.log("Opção inválida. Tente novamente.");
                menu();
        }
    });
    }, timeout = 1000);
}

function preMenu(){
    rl.question("Aperte qualquer tecla para continuar...", (answer) => {
        console.clear();
        menu();
    }
    );
}

function CreateWallet() {
    const myWallet = WalletService.createWallet()
    myAddress = myWallet.address;

    console.log("Carteira criada com sucesso!");
    console.log("Endereço: " + myAddress);
    console.log("");
    console.log("Chave privada: " + myWallet.privateKey);
    console.log("Frase mnemonica: " + myWallet.mnemonic.phrase);
    preMenu();
}

function recoverWallet() {
    console.clear();
    rl.question(`Qual a sua chave privada ou a sua frase mnemonica `, (pkOrMnemonic) => {
        const myWallet = WalletService.recoverWallet(pkOrMnemonic);
        myAddress = myWallet.address;
 
        console.log(`Sua carteira foi recuperada com sucesso!`);
        console.log("carteira: " + myAddress);
 
        preMenu();
    })
}

async function getBalance() {
    console.clear();
    if (!myAddress) {
        console.log("Você ainda não possui uma carteira.");
        preMenu();
        return;
    }
    
    const { balanceInEth } = await WalletService.getBalance(myAddress);
    console.log(`${SYMBOL} ${balanceInEth}`);
 
    preMenu();
}

function sendTx() {
    console.clear();
 
    if (!myAddress) {
        console.log(`You don't have a wallet yet.`);
        return preMenu();
    }
 
    console.log(`Your wallet is ${myAddress}`);
    rl.question(`To Wallet: `, (toWallet) => {
        if (!WalletService.addressIsValid(toWallet)) {
            console.log(`Invalid wallet.`);
            return preMenu();
        }
 
        rl.question(`Amount (in ${SYMBOL}): `, async (amountInEth) => {
            if (!amountInEth) {
                console.log(`Invalid amount.`);
                return preMenu();
            }
 
            const tx = await WalletService.buildTransaction(toWallet, amountInEth);
 
            if (!tx) {
                console.log(`Insufficient balance (amount + fee).`);
                return preMenu();
            }
 
            try {
                const txReceipt = await WalletService.sendTransaction(tx);
                console.log("Transaction successful: ");
                console.log(txReceipt);
            }
            catch (err) {
                console.error(err);
            }
 
            return preMenu();
        })
    })
 
    preMenu();
}

function searchTx() {
    console.clear();
    rl.question(`Your tx hash: `, async (hash) => {
        const txReceipt = await WalletService.getTransaction(hash);
        console.log("Transaction receipt: ");
        console.log(txReceipt);
 
        return preMenu();
    })
}

menu();
