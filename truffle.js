require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 8545,
      gas: 4.612e6,
      gasPrice: 0x01,
      network_id: '*',
    },
    ropsten: {
      host: 'localhost',
      port: 1337,
      network_id: '3',
      from: '0xb571be0e1876dc43345cfb08e1ad2792f678aefd',
      gas: 4.612e6,
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
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
