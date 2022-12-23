import { unlink, writeFile } from 'node:fs/promises';
import { build } from './build.js';
import launch from '@leofcoin/launch-chain'
import WsClient from '@leofcoin/endpoint-clients/ws'
import HttpClient from '@leofcoin/endpoint-clients/http'

globalThis.DEBUG = true

const kebabCase = string => string
.replace(/([a-z])([A-Z])/g, "$1-$2")
.replace(/[\s_]+/g, '-')
.toLowerCase();

const deploy = async (code, params = [], network = 'leofcoin:peache', destination = './build/contracts') => {
  let client
  const {chain, endpoints, mode} = await launch({network, ws: { port: 4040 }, http: { port: 8080 }})
  console.log(chain, endpoints);
  const networkVersion = network.replace(':', '-')
  if (mode === 'direct') client = chain
  else {
    if (endpoints.length === 0 ) throw new Error('no endpoints found')
    let success = false
    for (const [] of Object.entries(endpoints)) {
      if (!success) {
        try {
          if (key === 'ws') client = await (await new WsClient(url, networkVersion)).init()
          if (key === 'http') client = await (await new HttpClient(url)).init()
          success = true
        } catch {
          throw new Error('deployment failed')
        }
      }
    }
  }
  const match = code.match(/export default class ([A-Z])\w+|export{([A-Z])\w+ as default}/g)
  if (match.length === 0) {
    throw new Error('No name detected')
  }
  const name = match[0].replace('export default class ', '').replace('export{', '').replace('as default}', '')
  const filename = kebabCase(name)
  const path = `./.tmp.${filename}.js`
  await writeFile(path, code)
  const selectedAccount = peernet.selectedAccount || await client.selectedAccount()
  await client.participate(selectedAccount)
  // code = await build(`./templates/wizard/${filename}.js`)
  code = await build(path)
  code = code.toString().replace(/export{([A-Z])\w+ as default}/g, `return ${name}`).replace(/\r?\n|\r/g, '')
  let tx = await client.deployContract(code, params)
  
  await unlink(path)
  const address = await client.createContractAddress(selectedAccount, code, params)
  if (tx.wait) await tx.wait()  
  return {code, name, address}
}

export { deploy as default }