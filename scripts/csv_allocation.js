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
let BATCH_SIZE = process.argv.slice(2)[1];
if(!BATCH_SIZE) BATCH_SIZE = 80;
let distribData = new Array();
let allocData = new Array();

async function setAllocation() {

  console.log(`
    --------------------------------------------
    ---------Performing allocations ------------
    --------------------------------------------
  `);

  let accounts = await web3.eth.getAccounts();
  let userBalance = await web3.eth.getBalance(accounts[0]);

  let polyDistribution = await PolyDistribution.at(polyDistributionAddress);

  //console.log("%%%%%%%%%%%%%%%",distribData);
  //console.log(polyDistribution);
  for(var i = 0;i< distribData.length;i++){

    try{
      console.log("Attempting to allocate 250 POLYs to accounts:",distribData[i],"\n\n");
      let r = await polyDistribution.airdropTokens(distribData[i],{from:accounts[0], gas:4500000, gasPrice:10000000000});
      console.log("---------- ---------- ---------- ----------");
      console.log("Allocation + transfer was successful.", r.receipt.gasUsed, "gas used.");
      console.log("---------- ---------- ---------- ----------\n\n")
    } catch (err){
      console.log("ERROR:",err);
    }

    // let prevAllocation = await polyDistribution.allocations(distribData[i],{from:accounts[0]});
    // if(prevAllocation[3].toNumber() ==0){
    //   try{
    //     console.log("Attempting to allocate 250 POLYs to account",distribData[i]);
    //     polyDistribution.airdropTokens(distribData[i],{from:accounts[0], gas:300000, gasPrice:20000000000});
    //     //let allocation = await polyDistribution.allocations(distribData[i][1],{from:accounts[0]});
    //     //console.log(r);
    //     //console.log("Allocated", allocation[3].toString(10), "tokens for account:",distribData[i][1]);
    //   } catch (err){
    //     console.log(err);
    //   }
    // }else{
    //   console.log('\x1b[31m%s\x1b[0m',"SKIPPED token allocation for account:",distribData[i][1],". Account already has", prevAllocation[3].toString(10));
    // }
  }

}


function readFile() {
  var stream = fs.createReadStream("scripts/distrib.csv");

  let index = 0;
  let batch = 0;

  console.log(`
    --------------------------------------------
    --------- Parsing distrib.csv file ---------
    --------------------------------------------

    ******** Removing beneficiaries without tokens or address data
  `);

  //console.log("QQQ",distribData);

  var csvStream = csv()
      .on("data", function(data){
          let isAddress = web3.utils.isAddress(data[0]);
          if(isAddress && data[0]!=null && data[0]!='' ){
            allocData.push(data[0]);

            index++;
            if(index >= BATCH_SIZE)
            {
              distribData.push(allocData);
            //  console.log("DIS",distribData);
              allocData = [];
            //  console.log("ALLOC",allocData);
              index = 0;
            }

          }
      })
      .on("end", function(){
           //Add last remainder batch
           distribData.push(allocData);
           allocData = [];

           setAllocation();
      });

  stream.pipe(csvStream);
}

if(polyDistributionAddress){
  console.log("Processing airdrop. Batch size is",BATCH_SIZE, "accounts per transaction");
  readFile();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
