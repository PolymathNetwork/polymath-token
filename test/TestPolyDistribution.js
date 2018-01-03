const PolyDistribution = artifacts.require("./PolyDistribution.sol");
const PolyToken = artifacts.require("./PolyToken.sol");
const Web3 = require('web3')

var BigNumber = require('bignumber.js')

//The following line is required to use timeTravel with web3 v1.x.x
Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port

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
  let polyToken;
  let polyTokenAddress;
  let timeOffset = 3600 * 24 * 30; // Starts in 30 days
  let _startTime = Math.floor(new Date().getTime() /1000 + timeOffset); // Starts 10 min from now

  let account_owner     = accounts[0];
  let account_presale   = accounts[1];
  let account_founder1  = accounts[2];
  let account_founder2  = accounts[3];
  let account_airdrop1  = accounts[4];
  let account_airdrop2  = accounts[5];
  let account_airdrop3  = accounts[6];
  let account_advisor1  = accounts[7];
  let account_advisor2  = accounts[8];
  let account_reserve   = accounts[9];

  let allocationStruct = {
    AllocationSupply: 0,    // Type of allocation
    endCliff: 0,            // Tokens are locked until
    endVesting: 0,          // This is when the tokens are fully unvested
    totalAllocated: 0,       // Total tokens allocated
    amountClaimed: 0        // Total tokens claimed
  }

  let contractStartTime;

  function setAllocationStruct(_struct){
    allocationStruct.AllocationSupply = _struct[0].toNumber();
    allocationStruct.endCliff = _struct[1].toNumber();
    allocationStruct.endVesting = _struct[2].toNumber();
    allocationStruct.totalAllocated = _struct[3].toNumber();
    allocationStruct.amountClaimed = _struct[4].toNumber();
  }

  function logWithdrawalData(_allocationType, _currentBlockTime, _account_presale, _contractStartTime, _allocation, _new_presale_tokenBalance){
    console.log("\n");
    logTitle("Review tokens withdrawn for "+ _allocationType +" account:\n" + _account_presale);
    console.log("Current time:", _currentBlockTime.toString(10));
    console.log("Start time:", _contractStartTime.toString(10));
    console.log("Cliff End:", _allocation[1].toString(10));
    console.log("Vesting End:", _allocation[2].toString(10));
    console.log("Tokens Allocated:", _allocation[3].toString(10));
    console.log("Tokens Claimed :", _allocation[4].toString(10));
    console.log("POLY token balance :", _new_presale_tokenBalance.toString(10));
    console.log("\n");
  }

  function calculateExpectedTokens(_allocation, _currentTime, _contractStartTime){
    //If fully vested (vesting time >= now) return all the allocation, else, calculate the proportion
    if(_currentTime >= _allocation[2].toNumber())
      return _allocation[3].toNumber();
    else
      return Math.floor((_allocation[3].toNumber() * (_currentTime - _contractStartTime.toNumber())) / (_allocation[2].toNumber() - _contractStartTime.toNumber()));
  }

  before(async() => {
        polyDistribution = await PolyDistribution.new(_startTime,{from:accounts[0]});
        polyTokenAddress = await polyDistribution.POLY({from:accounts[0]});
        polyToken = await PolyToken.at(polyTokenAddress);

        contractStartTime = await polyDistribution.startTime({from:accounts[0]});
    });

  describe("All tests", async function () {

    describe("Test Constructor", async function () {

      it("should have deployed PolyToken", async function () {
        logTitle("PolyToken Address: "+ polyTokenAddress);
        assert.notEqual(polyTokenAddress.valueOf(), "0x0000000000000000000000000000000000000000", "Token was not initialized");
      });

    });

    ///////////////////////
    // Test allocations
    ///////////////////////

    describe("Allocations", async function () {

      let oldTotalSupply;
      let grantTotalAllocationSum = new BigNumber(0);

      before(async() => {
        oldTotalSupply = await polyDistribution.AVAILABLE_TOTAL_SUPPLY({from:account_owner});
      });

      describe("PRESALE Allocation", async function () {

        it("should allocate PRESALE tokens", async function () {

          let oldPresaleSupply = await polyDistribution.AVAILABLE_PRESALE_SUPPLY({from:account_owner});
          let tokenAllocation = 1000;

          await polyDistribution.setAllocation(account_presale,tokenAllocation,0,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_presale,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 0);

          console.log(allocationStruct);
          let newPresaleSupply = await polyDistribution.AVAILABLE_PRESALE_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newPresaleSupply.toNumber(),oldPresaleSupply.toNumber() + tokenAllocation);

        });
      });

      describe("FOUNDER Allocation", async function () {

        it("should allocate FOUNDER tokens for founder 1", async function () {

          let oldFounderSupply = await polyDistribution.AVAILABLE_FOUNDER_SUPPLY({from:account_owner});
          let tokenAllocation = 50000;

          await polyDistribution.setAllocation(account_founder1,tokenAllocation,1,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_founder1,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 1);

          console.log(allocationStruct);
          let newFounderSupply = await polyDistribution.AVAILABLE_FOUNDER_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newFounderSupply.toNumber(),oldFounderSupply.toNumber() + tokenAllocation);

        });

        it("should allocate FOUNDER tokens for founder 2", async function () {

          let oldFounderSupply = await polyDistribution.AVAILABLE_FOUNDER_SUPPLY({from:account_owner});
          let tokenAllocation = 175000;

          await polyDistribution.setAllocation(account_founder2,tokenAllocation,1,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_founder2,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 1);

          console.log(allocationStruct);
          let newFounderSupply = await polyDistribution.AVAILABLE_FOUNDER_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newFounderSupply.toNumber(),oldFounderSupply.toNumber() + tokenAllocation);

        });
      });

      describe("AIRDROP Allocation", async function () {

        it("should allocate AIRDROP tokens for airdrop 1", async function () {

          let oldAirdropSupply = await polyDistribution.AVAILABLE_AIRDROP_SUPPLY({from:account_owner});
          let tokenAllocation = 50;

          await polyDistribution.setAllocation(account_airdrop1,tokenAllocation,2,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_airdrop1,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 2);

          console.log(allocationStruct);
          let newAirdropSupply = await polyDistribution.AVAILABLE_AIRDROP_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newAirdropSupply.toNumber(),oldAirdropSupply.toNumber() + tokenAllocation);

        });

        it("should allocate AIRDROP tokens for airdrop 2", async function () {

          let oldAirdropSupply = await polyDistribution.AVAILABLE_AIRDROP_SUPPLY({from:account_owner});
          let tokenAllocation = 75;

          await polyDistribution.setAllocation(account_airdrop2,tokenAllocation,2,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_airdrop2,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 2);

          console.log(allocationStruct);
          let newAirdropSupply = await polyDistribution.AVAILABLE_AIRDROP_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newAirdropSupply.toNumber(),oldAirdropSupply.toNumber() + tokenAllocation);

        });
      });

      describe("ADVISOR Allocation", async function () {

        it("should allocate ADVISOR tokens for advisor 1", async function () {

          let oldAdvisorSupply = await polyDistribution.AVAILABLE_ADVISOR_SUPPLY({from:account_owner});
          let tokenAllocation = 3333;

          await polyDistribution.setAllocation(account_advisor1,tokenAllocation,3,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_advisor1,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 3);

          console.log(allocationStruct);
          let newAdvisorSupply = await polyDistribution.AVAILABLE_ADVISOR_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newAdvisorSupply.toNumber(),oldAdvisorSupply.toNumber() + tokenAllocation);

        });

        it("should allocate ADVISOR tokens for advisor 2", async function () {

          let oldAdvisorSupply = await polyDistribution.AVAILABLE_ADVISOR_SUPPLY({from:account_owner});
          let tokenAllocation = 7777;

          await polyDistribution.setAllocation(account_advisor2,tokenAllocation,3,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_advisor2,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 3);

          console.log(allocationStruct);
          let newAdvisorSupply = await polyDistribution.AVAILABLE_ADVISOR_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newAdvisorSupply.toNumber(),oldAdvisorSupply.toNumber() + tokenAllocation);

        });
      });

      describe("RESERVE Allocation", async function () {

        it("should allocate RESERVE tokens", async function () {

          let oldReserveSupply = await polyDistribution.AVAILABLE_RESERVE_SUPPLY({from:account_owner});
          let tokenAllocation = 1000;

          await polyDistribution.setAllocation(account_reserve,tokenAllocation,4,{from:account_owner});
          let allocation = await polyDistribution.allocations(account_reserve,{from:account_owner});

          setAllocationStruct(allocation);

          // Allocation must be equal to the passed tokenAllocation
          assert.equal(allocationStruct.totalAllocated, tokenAllocation);
          assert.equal(allocationStruct.AllocationSupply, 4);

          console.log(allocationStruct);
          let newReserveSupply = await polyDistribution.AVAILABLE_RESERVE_SUPPLY({from:account_owner});

          oldTotalSupply = new BigNumber(oldTotalSupply.minus(tokenAllocation));
          grantTotalAllocationSum = new BigNumber(grantTotalAllocationSum.plus(tokenAllocation));
          // Supply must match the new supply available
          assert.equal(newReserveSupply.toNumber(),oldReserveSupply.toNumber() + tokenAllocation);

        });
      });

      describe("Allocation post tests", async function () {

        it("New total supply should match allocations previously made", async function () {

          let newTotalSupply = await polyDistribution.AVAILABLE_TOTAL_SUPPLY({from:account_owner});
          assert.equal(oldTotalSupply.toString(10),newTotalSupply.toString(10));

        });

        it("Grand total should match allocations previously made", async function () {

          let grandTotalAllocated = await polyDistribution.grandTotalAllocated({from:account_owner});
          assert.equal(grantTotalAllocationSum.toString(10),grandTotalAllocated.toString(10));

        });
      });

      describe("Allocation invalid parameters", async function () {

        it("should reject invalid _supply codes", async function () {
          try {
            await polyDistribution.setAllocation(account_advisor1,1000,8,{from:account_owner});
          } catch (error) {
              logError("✅   Rejected invalid _supply code");
              return true;
          }
          throw new Error("I should never see this!")
        });

        it("should reject invalid address", async function () {
          try {
            await polyDistribution.setAllocation(0,1000,0,{from:account_owner});
          } catch (error) {
              logError("✅   Rejected invalid address");
              return true;
          }
          throw new Error("I should never see this!")
        });

        it("should reject invalid allocation", async function () {
          try {
            await polyDistribution.setAllocation(account_advisor1,0,0,{from:account_owner});
          } catch (error) {
              logError("✅   Rejected invalid allocation ");
              return true;
          }
          throw new Error("I should never see this!")
        });

        it("should reject repeated allocations", async function () {
          try {
            await polyDistribution.setAllocation(account_presale,1000,0,{from:account_owner});
          } catch (error) {
              logError("✅   Rejected repeated allocations ");
              return true;
          }
          throw new Error("I should never see this!")
        });

      });

    });

    ///////////////////////
    // Test withdrawal
    ///////////////////////

    describe("Withdrawal / transfer", async function () {

      describe("Withdraw immediately after allocations", async function () {

        before(async() => {
          //Time travel to startTime;
            await timeTravel(timeOffset+1)// Move forward in time so the crowdsale has started
            await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336
          });

        it("should withdraw PRESALE tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_presale,{from:accounts[0]});
          await polyDistribution.transferTokens(account_presale,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_presale,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_presale,{from:account_owner});

          logWithdrawalData("PRESALE",currentBlock.timestamp,account_presale,contractStartTime,allocation,new_tokenBalance);

          let expectedTokenBalance = calculateExpectedTokens(allocation,currentBlock.timestamp,contractStartTime);
          assert.equal(expectedTokenBalance.toString(10),new_tokenBalance.toString(10));
        });

        it("should fail to withdraw FOUNDER tokens as cliff period not reached", async function () {

          try {
            await polyDistribution.transferTokens(account_founder1,{from:accounts[0]});
          } catch (error) {
              let currentBlock = await web3.eth.getBlock("latest");

              let new_tokenBalance = await polyToken.balanceOf(account_founder1,{from:accounts[0]});
              let allocation = await polyDistribution.allocations(account_founder1,{from:account_owner});
              logWithdrawalData("FOUNDER",currentBlock.timestamp,account_founder1,contractStartTime,allocation,new_tokenBalance);

              logError("✅   Failed to withdraw");
              return true;
          }
          throw new Error("I should never see this!")

        });

        it("should fail to withdraw ADVISOR tokens as cliff period not reached", async function () {

          try {
            await polyDistribution.transferTokens(account_advisor1,{from:accounts[0]});
          } catch (error) {
              let currentBlock = await web3.eth.getBlock("latest");

              let new_tokenBalance = await polyToken.balanceOf(account_advisor1,{from:accounts[0]});
              let allocation = await polyDistribution.allocations(account_advisor1,{from:account_owner});
              logWithdrawalData("ADVISOR",currentBlock.timestamp,account_advisor1,contractStartTime,allocation,new_tokenBalance);

              logError("✅   Failed to withdraw");
              return true;
          }
          throw new Error("I should never see this!")

        });

        it("should fail to withdraw RESERVE tokens as cliff period not reached", async function () {

          try {
            await polyDistribution.transferTokens(account_reserve,{from:accounts[0]});
          } catch (error) {
              let currentBlock = await web3.eth.getBlock("latest");

              let new_tokenBalance = await polyToken.balanceOf(account_reserve,{from:accounts[0]});
              let allocation = await polyDistribution.allocations(account_reserve,{from:account_owner});
              logWithdrawalData("RESERVE",currentBlock.timestamp,account_reserve,contractStartTime,allocation,new_tokenBalance);

              logError("✅   Failed to withdraw");
              return true;
          }
          throw new Error("I should never see this!")

        });

      });

      describe("Withdraw 6 months after allocations", async function () {

        before(async() => {
          //Time travel to startTime + 6 months;
            await timeTravel((3600 * 24 * 180))// Move forward in time so the crowdsale has started
            await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336
        });

        it("should withdraw AIRDROP tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_airdrop1,{from:accounts[0]});
          await polyDistribution.transferTokens(account_airdrop1,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_airdrop1,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_airdrop1,{from:account_owner});

          logWithdrawalData("AIRDROP",currentBlock.timestamp,account_airdrop1,contractStartTime,allocation,new_tokenBalance);

          let expectedTokenBalance = calculateExpectedTokens(allocation,currentBlock.timestamp,contractStartTime);
          assert.equal(expectedTokenBalance.toString(10),new_tokenBalance.toString(10));
        });

      });

      describe("Withdraw 9 months after allocations", async function () {

        before(async() => {
          //Time travel to startTime + 9 months;
            await timeTravel((3600 * 24 * 90))// Move forward in time so the crowdsale has started
            await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336
        });

        it("should withdraw AIRDROP tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_airdrop1,{from:accounts[0]});
          await polyDistribution.transferTokens(account_airdrop1,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_airdrop1,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_airdrop1,{from:account_owner});

          logWithdrawalData("AIRDROP",currentBlock.timestamp,account_airdrop1,contractStartTime,allocation,new_tokenBalance);

        });

        it("should withdraw AIRDROP tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_airdrop2,{from:accounts[0]});
          await polyDistribution.transferTokens(account_airdrop2,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_airdrop2,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_airdrop2,{from:account_owner});

          logWithdrawalData("AIRDROP",currentBlock.timestamp,account_airdrop2,contractStartTime,allocation,new_tokenBalance);

          let expectedTokenBalance = calculateExpectedTokens(allocation,currentBlock.timestamp,contractStartTime);
          assert.equal(expectedTokenBalance.toString(10),new_tokenBalance.toString(10));
        });

      });

      describe("Withdraw 15 months after allocations", async function () {

        before(async() => {
          //Time travel to startTime + 9 months;
            await timeTravel((3600 * 24 * 180))// Move forward in time so the crowdsale has started
            await mineBlock() // workaround for https://github.com/ethereumjs/testrpc/issues/336
        });

        it("should withdraw FOUNDER tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_founder1,{from:accounts[0]});
          await polyDistribution.transferTokens(account_founder1,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_founder1,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_founder1,{from:account_owner});

          logWithdrawalData("FOUNDER",currentBlock.timestamp,account_founder1,contractStartTime,allocation,new_tokenBalance);

          let expectedTokenBalance = calculateExpectedTokens(allocation,currentBlock.timestamp,contractStartTime);
          assert.equal(expectedTokenBalance.toString(10),new_tokenBalance.toString(10));
        });

        it("should withdraw RESERVE tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_reserve,{from:accounts[0]});
          await polyDistribution.transferTokens(account_reserve,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_reserve,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_reserve,{from:account_owner});

          logWithdrawalData("RESERVE",currentBlock.timestamp,account_reserve,contractStartTime,allocation,new_tokenBalance);

          let expectedTokenBalance = calculateExpectedTokens(allocation,currentBlock.timestamp,contractStartTime);
          assert.equal(expectedTokenBalance.toString(10),new_tokenBalance.toString(10));
        });

        it("should withdraw ADVISOR tokens", async function () {
          let currentBlock = await web3.eth.getBlock("latest");

          // Check token balance for account before calling transferTokens, then check afterwards.
          let tokenBalance = await polyToken.balanceOf(account_advisor1,{from:accounts[0]});
          await polyDistribution.transferTokens(account_advisor1,{from:accounts[0]});
          let new_tokenBalance = await polyToken.balanceOf(account_advisor1,{from:accounts[0]});

          //PRESALE tokens are completely distributed once allocated as they have no vesting period nor cliff
          let allocation = await polyDistribution.allocations(account_advisor1,{from:account_owner});

          logWithdrawalData("ADVISOR",currentBlock.timestamp,account_advisor1,contractStartTime,allocation,new_tokenBalance);

          let expectedTokenBalance = calculateExpectedTokens(allocation,currentBlock.timestamp,contractStartTime);
          assert.equal(expectedTokenBalance.toString(10),new_tokenBalance.toString(10));
        });

      });

    });

    ///////////////////////
    // Test others
    ///////////////////////

    describe("Ether Transfers", async function () {

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
});
