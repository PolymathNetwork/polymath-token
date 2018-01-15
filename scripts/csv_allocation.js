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
        console.log("Attempting to allocate",distribData[i][0], "to account",distribData[i][1]);
        polyDistribution.setAllocation(distribData[i][1],new BigNumber(distribData[i][0] * (10 ** 18)),2,{from:accounts[0], gas:300000, gasPrice:5000000000});
        //let allocation = await polyDistribution.allocations(distribData[i][1],{from:accounts[0]});
        //console.log(r);
        //console.log("Allocated", allocation[3].toString(10), "tokens for account:",distribData[i][1]);
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

           //setAllocationWithPrivateKey();
           setAllocation();
      });

  stream.pipe(csvStream);
}

// async function getPastEvents(){
//
//   let polyDistribution = new web3.eth.Contract(ABI, polyDistributionAddress);
//
//   polyDistribution.getPastEvents('LogNewAllocation', {
//     fromBlock: 0,
//     toBlock: 'latest'
//   }, function(error, events){ console.log(events); })
//   .then(function(events){
//       console.log(events) // same results as the optional callback above
//   });
//
// }

//getPastEvents();

if(polyDistributionAddress){
  readFile();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
