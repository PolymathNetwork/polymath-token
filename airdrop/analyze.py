import csv
import time
import pandas as pd
import requests
import json
from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.mainnet
transactions = db.transactions
balances = db.airdrop

with open('airdrop.csv', 'rb') as csvfile:
    users = pd.read_csv(csvfile)

    for index, row in users.iterrows():
        if type(row.address) is str:
            tx = transactions.find_one({"address": row.address})
            balance = balances.find_one({"address": row.address})
            if balance:
                txid = transactions.update_one({"address": row.address}, {'$set': {"balance": balance['balance']}})
                print (tx, balance['balance']/10^18)
