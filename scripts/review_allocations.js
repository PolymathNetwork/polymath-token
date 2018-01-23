var fs = require('fs');
var csv = require('fast-csv');
var BigNumber = require('bignumber.js');

const polyDistributionArtifacts = require('../build/contracts/PolyDistribution.json');
const polyTokenArtifacts = require('../build/contracts/PolyToken.json');
const contract = require('truffle-contract');
let PolyDistribution = contract(polyDistributionArtifacts);
let PolyToken = contract(polyTokenArtifacts);
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

PolyToken.setProvider(web3.currentProvider);
//dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof PolyToken.currentProvider.sendAsync !== "function") {
  PolyToken.currentProvider.sendAsync = function() {
    return PolyToken.currentProvider.send.apply(
      PolyToken.currentProvider, arguments
    );
  };
}

let polyDistributionAddress = process.argv.slice(2)[0];

async function listAllocations() {
    let accounts = await web3.eth.getAccounts();
    let polyDistribution = await PolyDistribution.at(polyDistributionAddress);

    let polytokenAddress = await polyDistribution.POLY({from:accounts[0]});

    let polyToken = await PolyToken.at(polytokenAddress);
    //console.log(polyToken);

    let bal = await polyToken.balanceOf(polyDistribution.address);
    console.log("BAL",bal);

    var events = await polyToken.Transfer({from: polyDistribution.address},{fromBlock: 0, toBlock: 'latest'});
    events.get(function(error, log) {
        event_data = log;
        //console.log(log);
        for (var i=0; i<event_data.length;i++){
            let tokens = event_data[i].args.value.times(10 ** -18).toString(10);
            let addressB = event_data[i].args.to;
            console.log(`Distributed ${tokens} POLY to address ${addressB}`);
        }
    });

}

if(polyDistributionAddress){
  listAllocations();
}else{
  console.log("Please run the script by providing the address of the PolyDistribution contract");
}
