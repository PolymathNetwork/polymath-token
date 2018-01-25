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

async function setAllocation() {

  console.log(`
    --------------------------------------------
    ---------Performing allocations ------------
    --------------------------------------------
  `);

    var sumAllocations = 0;
    var sumAccountsAllocated = 0;

    let accounts = await web3.eth.getAccounts();
    let userBalance = await web3.eth.getBalance(accounts[0]);

    let polyDistribution = await PolyDistribution.at(polyDistributionAddress);
    console.log(allocData);
    for(var i = 0;i< allocData.length;i++){

        let prevAllocation = await polyDistribution.allocations(allocData[i][0],{from:accounts[0]});
        let tokens = new BigNumber(allocData[i][1]);
        if(prevAllocation[3].toNumber() ==0){
            try{

                let receipt = await polyDistribution.setAllocation(allocData[i][0],web3.utils.toWei(tokens.toString(10)),ALLOC_TYPE,{from:accounts[0], gas:200000});
                if(receipt && receipt.logs.length >0){
                    let tokensAllocated = receipt.logs[0].args._totalAllocated.times(10 ** -18).toString(10);
                    console.log("Allocated", tokensAllocated, "tokens for account:",allocData[i][0]);
                    sumAllocations += tokens.toNumber();
                    sumAccountsAllocated +=1;
                }else{
                    console.log("Tried to allocate", tokens.toString(10), "POLY tokens for account:",allocData[i][0]);
                    console.log('\x1b[31m%s\x1b[0m',"ERROR, allocation was not successful. The most probable cause is that the intended allocation exceeds the remaining supply.");
                }

            } catch (err){
            console.log(err);
          }
        }else{
          console.log('\x1b[31m%s\x1b[0m',"SKIPPED token allocation for account:",allocData[i][0],". Account already has", prevAllocation[3].toString(10));
        }
    }

    console.log('\x1b[32m%s\x1b[0m',"Successfully allocated",sumAllocations, "POLY tokens to ", sumAccountsAllocated,"accounts");

}


function readFile() {
  var stream;
  //console.log(ALLOC_TYPE, "=====");
  switch (ALLOC_TYPE) {
      case 0: //PRESALE
          stream = fs.createReadStream("scripts/data/presale.csv");
          break;
      case 1: //FOUNDER
          stream = fs.createReadStream("scripts/data/founders.csv");
          break;
      case 2: // AIRDROP
          break;
      case 3: // ADVISOR
          stream = fs.createReadStream("scripts/data/advisors.csv");
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
           setAllocation();
      });

  stream.pipe(csvStream);
}

if(polyDistributionAddress){
  readFile();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
