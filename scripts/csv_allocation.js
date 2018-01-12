var fs = require('fs');
var csv = require('fast-csv');
var BigNumber = require('bignumber.js');
var Tx = require('ethereumjs-tx');

const polyDistributionArtifacts = require('../build/contracts/PolyDistribution.json');
const contract = require('truffle-contract');
let PolyDistribution = contract(polyDistributionArtifacts);
const Web3 = require('web3');


if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/APIKEY'));
}

var address = ''; // Account performing the allocation
var key = ''; // BE CAREFUL!!! private key of the account performing the allocation

PolyDistribution.setProvider(web3.currentProvider);
//dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof PolyDistribution.currentProvider.sendAsync !== "function") {
  PolyDistribution.currentProvider.sendAsync = function() {
    return PolyDistribution.currentProvider.send.apply(
      PolyDistribution.currentProvider, arguments
    );
  };
}

var ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_recipient",
        "type": "address"
      }
    ],
    "name": "transferTokens",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_PRESALE_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_recipient",
        "type": "address"
      },
      {
        "name": "_totalAllocated",
        "type": "uint256"
      },
      {
        "name": "_supply",
        "type": "uint8"
      }
    ],
    "name": "setAllocation",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_AIRDROP_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "grandTotalAllocated",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_FOUNDER_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_BONUS_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "allocations",
    "outputs": [
      {
        "name": "AllocationSupply",
        "type": "uint8"
      },
      {
        "name": "endCliff",
        "type": "uint256"
      },
      {
        "name": "endVesting",
        "type": "uint256"
      },
      {
        "name": "totalAllocated",
        "type": "uint256"
      },
      {
        "name": "amountClaimed",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_recipient",
        "type": "address"
      },
      {
        "name": "_token",
        "type": "address"
      }
    ],
    "name": "refundTokens",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "startTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "grandTotalClaimed",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_TOTAL_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "POLY",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_ADVISOR_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "AVAILABLE_RESERVE_SUPPLY",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_startTime",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_fromSupply",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "_totalAllocated",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_grandTotalAllocated",
        "type": "uint256"
      }
    ],
    "name": "LogNewAllocation",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_fromSupply",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "_amountClaimed",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_totalAllocated",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_grandTotalClaimed",
        "type": "uint256"
      }
    ],
    "name": "LogPolyClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  }
];

async function doAllocationRaw(beneficiary, tokens, transactionCount) {

  var privateKey = new Buffer(key, 'hex')

  let poly =  new web3.eth.Contract(ABI, polyDistributionAddress);

  var funcData = poly.methods.setAllocation(beneficiary,tokens,2).encodeABI();
  var rawTx = {
    nonce: web3.utils.toHex(transactionCount),
    gasLimit: web3.utils.toHex(200000),
    gasPrice: web3.utils.toHex(40000000000),
    to: polyDistributionAddress,
    value: '0x00',
    data: funcData
  }

  var tx = new Tx(rawTx);
  tx.sign(privateKey);

  var serializedTx = tx.serialize();
  console.log("Attempting to allocate",tokens, "to account",beneficiary);
  let receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  //console.log(receipt);
}

let polyDistributionAddress = process.argv.slice(2)[0];
let distribData = new Array();

async function setAllocation() {

  console.log(`
    --------------------------------------------
    ---------Performing allocations ------------
    --------------------------------------------
  `);

  let accounts = await web3.eth.getAccounts();
  let userBalance = await web3.eth.getBalance(accounts[0]);

  let polyDistribution = await PolyDistribution.at(polyDistributionAddress);
  //console.log(polyDistribution);
  for(var i = 0;i< distribData.length;i++){

    let prevAllocation = await polyDistribution.allocations(distribData[i][1],{from:accounts[0]});
    if(prevAllocation[3].toNumber() ==0){
      try{
        await polyDistribution.setAllocation(distribData[i][1],distribData[i][0],2,{from:accounts[0], gas:300000});
        let allocation = await polyDistribution.allocations(distribData[i][1],{from:accounts[0]});

        console.log("Allocated", allocation[3].toString(10), "tokens for account:",distribData[i][1]);
      } catch (err){
        console.log(err);
      }
    }else{
      console.log('\x1b[31m%s\x1b[0m',"SKIPPED token allocation for account:",distribData[i][1],". Account already has", prevAllocation[3].toString(10));
    }
  }

}

async function setAllocationWithPrivateKey() {

  console.log(`
    --------------------------------------------
    ---------Performing allocations ------------
    --------------------------------------------
  `);

  let acc = await web3.eth.accounts.privateKeyToAccount("0x"+key);
  let account = acc.address;

  let userBalance = await web3.eth.getBalance(account);
  //console.log(userBalance);

  let polyDistribution = await PolyDistribution.at(polyDistributionAddress);
  let nonce = await web3.eth.getTransactionCount(address);
  //console.log(polyDistribution);
  for(var i = 0;i< distribData.length;i++){

    let prevAllocation = await polyDistribution.allocations(distribData[i][1],{from:account});
    if(prevAllocation[3].toNumber() ==0){
      try{
        doAllocationRaw(distribData[i][1],distribData[i][0],nonce);
        let allocation = await polyDistribution.allocations(distribData[i][1],{from:account});

        //console.log("Allocated", allocation[3].toString(10), "tokens for account:",distribData[i][1]);
        nonce++;
      } catch (err){
        console.log(err);
      }
    }else{
      console.log('\x1b[31m%s\x1b[0m',"SKIPPED token allocation for account:",distribData[i][1],". Account already has", prevAllocation[3].toString(10));
    }
  }

}

function readFile() {
  var stream = fs.createReadStream("scripts/distrib.csv");

  let index = 0;

  console.log(`
    --------------------------------------------
    --------- Parsing distrib.csv file ---------
    --------------------------------------------

    ******** Removing beneficiaries without tokens or address data
  `);

  var csvStream = csv()
      .on("data", function(data){
          if((data[0] != null && data[0] != '' && data[0] != '0') && (data[1]!=null && data[1]!='' )){
            data[0] = parseInt(data[0]);
            distribData[index] = data;
            index++;
          }
      })
      .on("end", function(){
           console.log(distribData);

           setAllocationWithPrivateKey();
           //setAllocation();
      });

  stream.pipe(csvStream);
}



if(polyDistributionAddress){
  readFile();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
