#!/usr/bin/env python3

import requests
import json
from htmldom import htmldom

url = 'https://192.168.0.1/jsonrpc'

headers = {
   'Content-Type': 'application/json'
}

login_data = {"jsonrpc":"2.0","method":"login","params":{"user":"cisco","pass":"cGFzc3dvcmQ=","lang":"English"}}


response = requests.post(url, data=json.dumps(login_data), headers=headers, verify=False)

#print(response.text)
#print(response.headers)

session_id = json.loads(response.text).get('result').get('errstr')

dhcp_bindings = {"jsonrpc":"2.0","method":"get_dhcp_binding_state","params":""}

headers['Cookie'] = 'sessionid={}'.format(session_id)

response = requests.post(url, data=json.dumps(dhcp_bindings), headers=headers, verify=False)

#print(response.text)
#print(response.headers)

obj = json.loads(response.text)

bindings = obj.get('result').get('dhcp-binding-state').get('entry')

bindings = sorted(bindings, key=lambda o: int(o.get('ip-address').split('.')[3]))

mac_set = set()
mac_dic = dict()

items = []

for item in bindings:
    ip = item.get('ip-address')
    mac = item.get('mac')
    lease = item.get('lease-expire-time')
    _type = item.get('type')
    hostname = item.get('hostname')

    mac_prefix = mac[0:8]
    mac_set.add(mac_prefix)

    ele = {'ip': ip, 'mac': mac, 'hostname': hostname, 'mac_prefix': mac_prefix}
    items.append(ele)

    #print('{}\t{}\t\t{}'.format(ip, mac, hostname))


mac_dic = { k: v for k, v in zip(mac_set, mac_set) }

print('mac vendor size : ', len(mac_set))
for key in mac_dic.keys():
    q = key.upper().replace(':', '-')
    print('# querying {}'.format(q))
    page = htmldom.HtmlDom('https://hwaddress.com/oui-iab/{}/'.format(q)).createDom()
    found = [ i.text() for i in page.find('div.container div.table-responsive td') ]
    mac_dic[key] = found[2].strip() if found else '[not found]'
    # break
    # if q == '18-81-0E': break

for item in items:
   mac_k = item.get('mac_prefix')
   item['vendor'] = mac_dic.get(mac_k)
   # print(item)
   # print('\t'.join(item))
   print('{ip}\t{mac}\t\t{hostname}\t{vendor}\t'.format(**item))


'''
https://hwaddress.com/oui-iab/A8-E5-39/
htmldom.HtmlDom('https://hwaddress.com/oui-iab/A8-E5-39/').createDom()
[ i.text() for i in page.find('div.container div.table-responsive td') ]
'''
