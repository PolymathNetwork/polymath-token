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
  web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));
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
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "airdropAdmins",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
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
    "name": "AVAILABLE_BONUS3_SUPPLY",
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
    "name": "AVAILABLE_BONUS1_SUPPLY",
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
    "name": "INITIAL_SUPPLY",
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
    "constant": false,
    "inputs": [
      {
        "name": "_admin",
        "type": "address"
      },
      {
        "name": "_isAdmin",
        "type": "bool"
      }
    ],
    "name": "setAirdropAdmin",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "constant": false,
    "inputs": [
      {
        "name": "_recipient",
        "type": "address[]"
      }
    ],
    "name": "deleteAirdropAllocation",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "constant": false,
    "inputs": [
      {
        "name": "_recipient",
        "type": "address[]"
      }
    ],
    "name": "withdrawFromAirdrop",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "name": "airdropAllocations",
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
    "name": "AVAILABLE_BONUS2_SUPPLY",
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
    "name": "airdropWithdrawn",
    "outputs": [
      {
        "name": "",
        "type": "bool"
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
        "name": "_recipient",
        "type": "address[]"
      },
      {
        "name": "_totalAllocated",
        "type": "uint256[]"
      }
    ],
    "name": "performAirdropAllocation",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
        "indexed": true,
        "name": "_recipient",
        "type": "address"
      },
      {
        "indexed": true,
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
        "indexed": true,
        "name": "_recipient",
        "type": "address"
      },
      {
        "indexed": true,
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

let polyDistributionAddress = process.argv.slice(2)[0];
let offset = parseInt(process.argv.slice(2)[1]);
let limit = parseInt(process.argv.slice(2)[2]);
let offsetIndex = 0;
let tokensData = new Array();
let addressData = new Array();

let allocSum = 0;

function readFileO() {
  var stream = fs.createReadStream("scripts/distrib.csv");

  let index = 0;

  console.log(offset, limit);

  console.log(`
    --------------------------------------------
    --------- Parsing distrib.csv file ---------
    --------------------------------------------

    ******** Removing beneficiaries without tokens or address data
  `);

  var csvStream = csv()
      .on("data", function(data){
          if((data[0] != null && data[0] != '' && data[0] != '0') && (data[1]!=null && data[1]!='' )){
            //console.log(index);
            data[0] = new BigNumber(parseInt(data[0]) * (10 ** 18)).toString(10);
            tokensData[index] = data[0];
            addressData[index] = data[1];

            index++;
          }
      })
      .on("end", function(){

           //log arrays for manual processing
           //logArrays()


           doParallelAlloc();

      });

  stream.pipe(csvStream);
}

async function doParallelAlloc(){
  var arrSize = 100;
  let transactionCount = await web3.eth.getTransactionCount(address);
  for(var i = 0; i < 4;i++)
  {
    tokensDataToProcess = tokensData.slice(i * arrSize, (i+1) * arrSize);
    addressDataToProcess = addressData.slice(i * arrSize, (i+1) * arrSize);
    doAllocationRawO(addressDataToProcess,tokensDataToProcess,transactionCount);
    transactionCount++;
  }
}

async function doAllocationRawO(_addressData,_tokensData,transactionCount) {

  var privateKey = new Buffer(key, 'hex')

  let poly =  new web3.eth.Contract(ABI, polyDistributionAddress);

  console.log("???",_addressData,_tokensData);
  console.log(transactionCount);
  var funcData = poly.methods.performAirdropAllocation(_addressData,_tokensData).encodeABI();
  var rawTx = {
    nonce: web3.utils.toHex(transactionCount),
    gasLimit: web3.utils.toHex(4600000),
    gasPrice: web3.utils.toHex(10000000000),
    to: polyDistributionAddress,
    value: '0x00',
    data: funcData
  }

  var tx = new Tx(rawTx);
  tx.sign(privateKey);

  var serializedTx = tx.serialize();
  //console.log("Attempting to allocate",tokens, "to account",beneficiary);
  let receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  //console.log(receipt);
}

//////////////////////
// BACKUP FUNCTIONS in case we need to do the process manually
/////////////////////

async function doAllocationRaw2() {

  var privateKey = new Buffer(key, 'hex')

  let poly =  new web3.eth.Contract(ABI, polyDistributionAddress);
  let transactionCount = await web3.eth.getTransactionCount(address);

  var funcData = poly.methods.performAirdropAllocation(addressData,tokensData).encodeABI();
  var rawTx = {
    nonce: web3.utils.toHex(transactionCount),
    gasLimit: web3.utils.toHex(4600000),
    gasPrice: web3.utils.toHex(10000000000),
    to: polyDistributionAddress,
    value: '0x00',
    data: funcData
  }

  var tx = new Tx(rawTx);
  tx.sign(privateKey);

  var serializedTx = tx.serialize();
  //console.log("Attempting to allocate",tokens, "to account",beneficiary);
  let receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  //console.log(receipt);
}

function readFile(offset,limit) {
  var stream = fs.createReadStream("scripts/distrib.csv");

  let index = 0;

  console.log(offset, limit);

  console.log(`
    --------------------------------------------
    --------- Parsing distrib.csv file ---------
    --------------------------------------------

    ******** Removing beneficiaries without tokens or address data
  `);

  var csvStream = csv()
      .on("data", function(data){
          if((data[0] != null && data[0] != '' && data[0] != '0') && (data[1]!=null && data[1]!='' )){
            if(index >= offset && index < limit+offset){
              //console.log(index);
              allocSum += parseInt(data[0]);
              data[0] = new BigNumber(parseInt(data[0]) * (10 ** 18)).toString(10);
              tokensData[offsetIndex] = data[0];
              addressData[offsetIndex] = data[1];
              offsetIndex++;
            }
            index++;
          }
      })
      .on("end", function(){

           //log arrays for manual processing
           //logArrays()
           doAllocationRaw2();
      });

  stream.pipe(csvStream);
}

function logArrays(){
  console.log("[");
   var i; // inportant to be outside
   for(i = 0; i < addressData.length - 1; i++)
       console.log("\""+addressData[i] + "\",");
   console.log("\""+addressData[i] + "\"],");

  console.log("[");
   var j; // inportant to be outside
   for(j = 0; j < tokensData.length - 1; j++)
       console.log("\""+tokensData[j] + "\",");
   console.log("\""+tokensData[j] + "\"]");

   console.log("Total to allocate from airdrop:",new BigNumber(allocSum).toString(10));

}

//////////////////////
// END OF BACKUP
/////////////////////

if(polyDistributionAddress){
  //readFile(offset,limit);
  readFileO();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
