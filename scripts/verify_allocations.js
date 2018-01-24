var fs = require('fs');
var csv = require('fast-csv');
var BigNumber = require('bignumber.js');

const polyDistributionArtifacts = require('../build/contracts/PolyDistribution.json');
const contract = require('truffle-contract');
let PolyDistribution = contract(polyDistributionArtifacts);
const Web3 = require('web3');


if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

PolyDistribution.setProvider(web3.currentProvider);
//dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof PolyDistribution.currentProvider.sendAsync !== "function") {
  PolyDistribution.currentProvider.sendAsync = function() {
    return PolyDistribution.currentProvider.send.apply(
      PolyDistribution.currentProvider, arguments
    );
  };
}

let polyDistributionAddress = process.argv.slice(2)[0];
let ALLOC_TYPE = parseInt(process.argv.slice(2)[1]);
if(!ALLOC_TYPE) ALLOC_TYPE = 0;
let allocData = new Array();

let ALLOC_STRING = new Array("PRESALE","FOUNDER","AIRDROP","ADVISOR","RESERVE","BONUS1","BONUS2","BONUS3");

async function verifyAllocation() {

  console.log(`
    --------------------------------------------
    ---------Reviewing allocations ------------
    --------------------------------------------
  `);

    var sumAllocations = 0;
    var sumAccountsAllocated = 0;
    var failedAllocs = 0;

    let accounts = await web3.eth.getAccounts();
    let userBalance = await web3.eth.getBalance(accounts[0]);

    let polyDistribution = await PolyDistribution.at(polyDistributionAddress);
    for(var i = 0;i< allocData.length;i++){

        let prevAllocation = await polyDistribution.allocations(allocData[i][0],{from:accounts[0]});
        let tokens = new BigNumber(allocData[i][1]);
        parsedAlloc = parseInt(web3.utils.fromWei(prevAllocation[3].toString(10)));
        if(prevAllocation[3].toNumber() ==0){
            failedAllocs +=1;
            console.log('\x1b[31m%s\x1b[0m',`Account ${allocData[i][0]} has not been allocated any POLY, review the transaction logs on Etherscan`);
        }else if (prevAllocation[0].toNumber() != ALLOC_TYPE){
            failedAllocs +=1;
            console.log('\x1b[31m%s\x1b[0m',`Existing allocation for account ${allocData[i][0]}. This account has already been allocated POLY of type ${ALLOC_STRING[prevAllocation[0]]}`);
        }else if (parsedAlloc != allocData[i][1]){
            failedAllocs +=1;
            console.log('\x1b[31m%s\x1b[0m',`Existing allocation for account ${allocData[i][0]} (${parsedAlloc} POLY) does not match the contents of the file (${allocData[i][1]} POLY). `);
        }else{
            sumAllocations += parseInt(web3.utils.fromWei(prevAllocation[3].toString(10)));
            sumAccountsAllocated +=1;
        }
    }

    console.log(`File contains ${allocData.length} valid addresses`);
    if(failedAllocs >0)
        console.log('\x1b[31m%s\x1b[0m',`${failedAllocs} allocations have failed, review them.`);
    console.log('\x1b[32m%s\x1b[0m',`${sumAllocations} POLY have been allocated to ${sumAccountsAllocated} accounts`);
}


function readFile() {
  var stream;
  //console.log(ALLOC_TYPE, "=====");
  switch (ALLOC_TYPE) {
      case 0: //PRESALE
          stream = fs.createReadStream("scripts/data/presale.csv");
          break;
      case 1: //FOUNDER
          stream = fs.createReadStream("scripts/data/founder.csv");
          break;
      case 2: // AIRDROP
          break;
      case 3: // ADVISOR
          stream = fs.createReadStream("scripts/data/advisor.csv");
          break;
      case 4: // RESERVE
          stream = fs.createReadStream("scripts/data/reserve.csv");
          break;
      case 5: // BONUS1
          stream = fs.createReadStream("scripts/data/bonus1.csv");
          break;
      case 6: // BONUS2
          stream = fs.createReadStream("scripts/data/bonus2.csv");
          break;
      case 7: // BONUS3
          stream = fs.createReadStream("scripts/data/bonus3.csv");
          break;
      default:

  }


  let index = 0;
  let batch = 0;

  console.log(`
    --------------------------------------------
    ------------- Parsing csv file -------------
    --------------------------------------------

    ******** Removing beneficiaries without tokens or address data
  `);


  var csvStream = csv()
      .on("data", function(data){
          let isAddress = web3.utils.isAddress(data[0]);
          if(isAddress && data[0]!=null && data[0]!='' ){
            data[1] = parseInt(data[1]);
            allocData.push([data[0],data[1]]);
          }
      })
      .on("end", function(){
           //Add last remainder batch
           //console.log(allocData);
           verifyAllocation();
      });

  stream.pipe(csvStream);
}

if(polyDistributionAddress){
  readFile();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
