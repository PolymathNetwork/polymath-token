import csv
import time
import pandas as pd
import requests
import json
import pymongo

try:
    client = pymongo.MongoClient("")
    db = client.mainnet
    collection = db.airdrop
    client.server_info()
except pymongo.errors.ServerSelectionTimeoutError as err:
    print(err)

# Open the file and parse data
# Schema1 ID,telegram,email,name,desc,other,accredited,airdrop,address,start,submit,network
# Schema2 ID, email,name,referral,other,desc,Other,airdrop,address,start,submit,network
with open('signups.csv', 'rb') as csvfile:
    signups = pd.read_csv(csvfile)
    count = 0
    for index, row in signups.iterrows():
        # Update entry in mongo
        accredited = True if row.accredited == 1 else False;
        airdrop = True if row.airdrop == 1 else False;
        try:
            post_id = collection.update({ "address": row.address}, {
                "telegram": str(row.telegram),
                "email": str(row.email),
                "name": str(row.name),
                "desc": str(row.desc),
                "other": str(row.other),
                "accredited": accredited,
                "airdrop": airdrop,
                "address": str(row.address),
                "start": str(row.start),
                "submit": str(row.submit),
                "network": str(row.network)
            }, upsert=True)
            print ('Inserted ' + str(post_id))
        except pymongo.errors.WriteError as err:
            print('Failed to insert eth address', row.address)
