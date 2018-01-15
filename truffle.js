require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 4500000,
    },
    mainnet: {
      host: 'localhost',
      port: 8545,
      network_id: '1', // Match any network id
      gas: 3500000,
      gasPrice: 10000000000
    },
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: '3', // Match any network id
      gas: 3500000,
      gasPrice: 50000000000
    },
    local: {
      host: 'localhost',
      port: 8545,
      gas: 4.612e6,
      gasPrice: 0x01,
      network_id: '*',
    },
    rinkeby: {
      network_id: 4,
      host: "localhost",
      port:  8545,
      account: 0x3fcf622ce12e21d738517dbe09dfeaa4f4552816,
      gas:2000000
      //gasPrice: 100000000000
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8545,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
 //   rpc: {
 // host: 'localhost',
 // post:8080
 //   },
  mocha: {
    useColors: true,
    slow: 30000,
    bail: true,
  },
  dependencies: {},
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
