const PolyToken = artifacts.require("./PolyToken.sol");
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

contract('PolyToken', function(accounts) {

  ////

  const DECIMALSFACTOR = new BigNumber('10').pow('18')

  const TOKEN_NAME = "Polymath";
  const TOKEN_SYMBOL = "POLY";
  const TOKEN_DECIMALS = 18;
  const TOTAL_SUPPLY = 1000000000 //* DECIMALSFACTOR;

  ////

  let polyToken;

  before(async() => {
        polyToken = await PolyToken.new(accounts[0],{from:accounts[0]});
    });

  describe("Token Basic Properties", async function () {

    it("Name", async function () {
      let tokenName = await polyToken.name({from:accounts[0]});
      assert.equal(tokenName.toString(),TOKEN_NAME);
    });

    it("Symbol", async function () {
      let tokenSymbol = await polyToken.symbol({from:accounts[0]});
      assert.equal(tokenSymbol.toString(),TOKEN_SYMBOL);
    });

    it("Decimals", async function () {
      let tokenDecimals = await polyToken.decimals({from:accounts[0]});
      assert.equal(parseInt(tokenDecimals),TOKEN_DECIMALS);
    });

    it("Total Supply", async function () {
      let tokenTotalSupply = await polyToken.totalSupply({from:accounts[0]});
      assert.equal(parseInt(tokenTotalSupply),TOTAL_SUPPLY);
    });
  });

  describe("Token Transfer Functions", async function () {

    it("should transfer from owner to another address", async function () {
      await polyToken.transfer(accounts[1],1000,{from:accounts[0]});
      let account1Balance = await polyToken.balanceOf(accounts[1],{from:accounts[0]});
      assert.equal(account1Balance,1000);
    });

    it('should FAIL to transfer to null address', async() => {
      try {
          await polyToken.transfer(0,1000,{from:accounts[0]});
      } catch (error) {
          logError("✅   Tried to transfer to null address and failed");
          return true;
      }
      throw new Error("I should never see this!")
    });

    it('should FAIL to transfer more tokens than available', async() => {
      try {
          await polyToken.transfer(accounts[1],1*1000000000*100,{from:accounts[0]});
      } catch (error) {
          logError("✅   Tried to transfer more tokens than available and failed");
          return true;
      }
      throw new Error("I should never see this!")
    });

  });

  describe("Token TransferFrom / Allowance Functions", async function () {

    it('should give an allowance of 9999 to another account', async() => {
      await polyToken.approve(accounts[3],9999,{from:accounts[0]});
      let allowance = await polyToken.allowance(accounts[0],accounts[3],{from:accounts[0]});
      assert.equal(parseInt(allowance),9999);
    });

    it('should transferFrom from allowance', async() => {
      await polyToken.transferFrom(accounts[0],accounts[4],3333,{from:accounts[3]});
      let updatedAllowance = await polyToken.allowance(accounts[0],accounts[3],{from:accounts[0]});
      assert.equal(parseInt(updatedAllowance),6666);

      let account4Balance = await polyToken.balanceOf(accounts[4],{from:accounts[0]});
      assert.equal(parseInt(account4Balance),3333);
    });

    it('should increase allowance', async() => {
      await polyToken.increaseApproval(accounts[5],100,{from:accounts[0]});
      let updatedAllowance = await polyToken.allowance(accounts[0],accounts[5],{from:accounts[0]});
      assert.equal(parseInt(updatedAllowance),100);
    });

    it('should decrease allowance', async() => {
      let allowanceToDecrease = 50;
      let origAllowance = await polyToken.allowance(accounts[0],accounts[5],{from:accounts[0]});
      await polyToken.decreaseApproval(accounts[5],allowanceToDecrease,{from:accounts[0]});
      let updatedAllowance = await polyToken.allowance(accounts[0],accounts[5],{from:accounts[0]});
      assert.equal(parseInt(origAllowance),parseInt(updatedAllowance) + allowanceToDecrease);
    });

    it('should completely decrease allowance', async() => {
      let allowanceToDecrease = 100000;
      let origAllowance = await polyToken.allowance(accounts[0],accounts[5],{from:accounts[0]});
      await polyToken.decreaseApproval(accounts[5],allowanceToDecrease,{from:accounts[0]});
      let updatedAllowance = await polyToken.allowance(accounts[0],accounts[5],{from:accounts[0]});
      assert.equal(parseInt(updatedAllowance),0);
    });

    it('should FAIL to transferFrom to null address', async() => {
      try {
          await polyToken.transferFrom(accounts[0],0,1,{from:accounts[3]});
      } catch (error) {
          logError("✅   Tried to transferFrom to null address and failed");
          return true;
      }
      throw new Error("I should never see this!")
    });

    it('should FAIL to transferFrom if _from has not enough balance', async() => {
      try {
          await polyToken.transferFrom(accounts[0],accounts[5],1*1000000000*100,{from:accounts[3]});
      } catch (error) {
          logError("✅   Tried to transferFrom without enough balance and failed");
          return true;
      }
      throw new Error("I should never see this!")
    });

    it('should FAIL to transferFrom more than the allowance granted', async() => {
      try {
          await polyToken.transferFrom(accounts[0],accounts[5],50000,{from:accounts[3]});
      } catch (error) {
          logError("✅   Tried to transferFrom without enough balance and failed");
          return true;
      }
      throw new Error("I should never see this!")
    });

  });

});
