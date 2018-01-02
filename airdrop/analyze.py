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
    print (err)

# _id,address,airdrop,desc,email,misc,name,network,other,referral,start,submit,telegram,accredited
with open('signups.csv', 'rb') as csvfile:
    signups = pd.read_csv(csvfile)
    # Get ether balance for each address
    count = 0
    url = "https://api.etherscan.io/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address="
    for index, row in signups.iterrows():
        if type(row.address) is str:
            # Generate POST request
            if (count < 20):
                url += row.address + ','
                count += 1
            else:
                # Make batch API call
                r = requests.post(url[:-1])
                json_data = json.loads(r.content)
                if (json_data['message'] != 'OK'):
                    print ('Failed to get ' + row.address)
                else:
                    # Iterate over balances
                    for i in json_data['result']:
                        try:
                            update_id = collection.update_one({ "address": i['account']}, { '$set': {"balance": i['balance']} })
                            print ('Updated balance for '+i['account'], update_id)
                        except pymongo.errors.WriteError as err:
                            print ('Failed to update', err)
                # Go to next batch
                url = "https://api.etherscan.io/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address="
                count = 0
                time.sleep(1)
