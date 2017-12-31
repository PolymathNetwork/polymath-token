import csv
import time
import pandas as pd
import requests
import json
from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.mainnet
collection = db.transactions
#import redis

# Constants
AIRDROP = 20000000
TOTALBALANCES = 12345

# Setup redis
# r = redis.StrictRedis(host='localhost', port=6379, db=0)

# Open the file and parse data
with open('airdrop.csv', 'rb') as csvfile:
    users = pd.read_csv(csvfile)
    ethereum_addresses = users.address

    # Get ether balance for each address
    count = 0
    for index, row in users.iterrows():
        if type(row.address) is str:
            # Make API call to etherscan
            r = requests.post("http://api.etherscan.io/api?module=account&action=txlist&startblock=0&endblock=99999999&sort=asc&apikey=XS38QQM4VVG3E6UQKPXH38PPYX4SGYY1PI&address=" + row.address)
            json_data = json.loads(r.content)
            if (json_data['message'] != 'OK'):
                print ('Failed to get ' + row.address)
            else:
                # Update entry in mongo
                try:
                    post_id = collection.update({ "address": json_data['result']}, {
                        "telegram": row.telegram,
                        "email": row.email,
                        "airdrop": row.airdrop,
                        "address": row.address,
                        "txs": len(json_data['result'])
                    }, upsert=True)
                    print ('Inserted ' + str(post_id))
                except:
                    print('Failed to insert document')
                count += 1
                if count == 100:
                    time.sleep(1)

    # Store ethereum address, balance, and allocation
    # allocation = balance / TOTALETHER * POLYAIRDROP
    # r.set(ethereum_address, balance, allocation)

# Merge balances into transactions table
with open('airdrop.csv', 'rb') as csvfile:
    users = pd.read_csv(csvfile)

    for index, row in users.iterrows():
        if type(row.address) is str:
            tx = transactions.find_one({"address": row.address})
            balance = balances.find_one({"address": row.address})
            if balance:
                txid = transactions.update_one({"address": row.address}, {'$set': {"balance": balance['balance']}})
                print (tx, balance/18)

print(ethereum_addresses)
