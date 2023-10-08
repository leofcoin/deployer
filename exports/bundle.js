import {rollup} from 'rollup'
import terser from '@rollup/plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'
import virtual from '@rollup/plugin-virtual';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const tsConfig = {
  "compilerOptions": {
    "module": "esnext",
    "target": "esnext",
    "outDir": "./exports",
    "moduleResolution":"nodenext",
    "declaration": true,
    "allowJs": true,
    "allowSyntheticDefaultImports": true,    
    "resolveJsonModule": true
  }
}

const generateOutputs = async (bundle) => {
  const { output } = await bundle.generate({
    format: 'es'
  })
console.log(output);
  for (const chunkOrAsset of output) {
    return chunkOrAsset.code
  }
}

const bundle = async (code, ts = true) => {
  const plugins = [
    virtual({
      entry: code
    }),
    json(),
    nodeResolve(),
    terser({
      mangle: false
    })
  ]
  ts && plugins.push(typescript(tsConfig))
  let output;
  try {
    output = await rollup({
      input: 'entry',
      plugins
    })
  } catch (error) {
    // do some error reporting
    console.error(error);
  }
  if (output) {
    const outputs = await generateOutputs(output)
    await output.close()


    code = code.toString().replace(/export{([A-Z])\w+ as default}/g, `return ${name}`).replace(/\r?\n|\r/g, '')
    return outputs
  }
}

export { bundle as default }