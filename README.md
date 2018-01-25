# Polymath (POLY) Token Distribution

<img src="https://travis-ci.org/PolymathNetwork/polymath-token-distribution.svg?branch=master"/> <a href="https://t.me/polymathnetwork" target="_blank"><img src="https://img.shields.io/badge/50k+-telegram-blue.svg"></a>

The Ethereum contracts for the [Polymath](https://polymath.network) (POLY) token
distribution. The primary purpose is to allocate tokens to purchasers, advisors,
reserve, community members, and founders.

![Polymath](Polymath.png)

POLY tokens are used to align incentives of network participants, and help
ensure compliant security token offerings.

# Live on Ethereum

#### [Testnet (Ropsten)](https://ropsten.etherscan.io/address/0x3f9d29ead6493db97e9756d54171e8844ce87ddd)

#### mainnet (coming soon)

# Contributing

If you find any issues please open a new issue on github.

# Community Airdrop

Please [join our Telegram](https://t.me/polymathnetwork) for details on the
airdrop!

# Performing the airdrop

1. Run `truffle migrate` to deploy the distribution and POLY token contract. Take note of the address of the PolyDistribution contract.
2. Add a csv file named `airdrop_distrib.csv` to the scripts folder. It should contain one valid address per row.
3. Run `node scripts/csv_allocation.js [ADDRESS of POLYDISTRIBUTION]` This will process the airdrop_distrib.csv file and transfer 250 POLY to each address.
4. Run `node scripts/verify_airdrop.js [ADDRESS of POLYDISTRIBUTION] > scripts/data/review.csv` to retrieve the event log of the distribution and output it to a csv file you can use to compare the intended distribution and the results.
