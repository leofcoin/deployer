import { unlink, writeFile } from 'node:fs/promises';
import bundle from './bundle.js';
import launch from '@leofcoin/launch-chain'
import WsClient from '@leofcoin/endpoint-clients/ws'
import HttpClient from '@leofcoin/endpoint-clients/http'

globalThis.DEBUG = true

const deploy = async (code, params = [], network = 'leofcoin:peach', destination = './build/contracts') => {
  let client
  const {chain, endpoints, mode} = await launch({network, ws: [{ url: 'wss://ws-remote.leofcoin.org' }], http: [{ url: 'https://remote.leofcoin.org' }]})
  console.log(chain, endpoints);
  const networkVersion = network.replace(':', '-')
  if (mode === 'direct') client = chain
  else {
    if (endpoints.length === 0 ) throw new Error('no endpoints found')
    let success = false
    for (const [key, url] of Object.entries(endpoints)) {
      if (!success) {
        console.log(key);
        try {
          if (key === 'ws') client = await (await new WsClient(url, networkVersion)).init()
          if (key === 'http') client = await new HttpClient(url)
          success = true
        } catch (error) {
          console.log(error);
          new Error('deployment failed')
        }
      }
    }
  }
  const match = code.match(/export default class ([A-Z])\w+|export{([A-Z])\w+ as default}/g)
  if (match.length === 0) {
    throw new Error('No name detected')
  }
  const name = match[0].replace('export default class ', '').replace('export{', '').replace('as default}', '')
  const selectedAccount = globalThis.peernet?.selectedAccount || await client.selectedAccount()
  console.log({selectedAccount});
  try {
    
  // await client.participate(selectedAccount)
  } catch (error) {
    console.log(error);
  }
  console.log('p');
  // code = await bundle(`./templates/wizard/${filename}.js`)
  code = await bundle(code)

  console.log({code});
  console.log(client);
  let tx = await client.deployContract(code, params)
  
 console.log(tx);
  const address = await client.createContractAddress(selectedAccount, code, params)
  
  if (tx.wait) await tx.wait 
  await unlink(path)
  return {code, name, address}
}

export { deploy as default }