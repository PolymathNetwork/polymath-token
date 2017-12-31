var PolyToken = artifacts.require('./PolyToken.sol');

module.exports = function(deployer) {
  deployer.deploy(PolyToken);
};
