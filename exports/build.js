import {rollup} from 'rollup'
import terser from '@rollup/plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'

const generateOutputs = async (bundle) => {
  const { output } = await bundle.generate({
    format: 'es'
  })

  for (const chunkOrAsset of output) {
    return chunkOrAsset.code
  }
}

export const build = async input => {
  let bundle;
  try {
    bundle = await rollup({ input, plugins: [
      nodeResolve(),
      terser({
        mangle: false,
        keep_classnames: true
      })
    ] })
  } catch (error) {
    // do some error reporting
    console.error(error);
  }
  if (bundle) {
    const outputs = await generateOutputs(bundle)
    await bundle.close()
    return outputs
  }
}

