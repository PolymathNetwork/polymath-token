const PolyDistribution = artifacts.require("./PolyDistribution.sol");
const Web3 = require('web3')

var BigNumber = require('bignumber.js')

//The following line is required to use timeTravel with web3 v1.x.x
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8555")) // Hardcoded development port

const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

const mineBlock = function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

const logTitle = function (title) {
  console.log("*****************************************");
  console.log(title);
  console.log("*****************************************");
}

const logError = function (err) {
  console.log("-----------------------------------------");
  console.log(err);
  console.log("-----------------------------------------");
}

contract('PolyDistribution', function(accounts) {

  let polyDistribution;

  before(async() => {
        polyDistribution = await PolyDistribution.new({from:accounts[0]});
    });

  describe("Blah", async function () {

    it("should reject transfers", async function () {
      try {
        await polyDistribution.sendTransaction({from:accounts[0], value:web3.utils.toWei("1","ether")});
      } catch (error) {
          logError("✅   Rejected incoming ether");
          return true;
      }
      throw new Error("I should never see this!")
    });

  });

});
