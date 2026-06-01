const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const modelsDir = path.join(__dirname, '..', 'public', 'models')

if (!fs.existsSync(modelsDir)) {
  console.error('No models directory found at', modelsDir)
  process.exit(1)
}

const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.glb'))
if (!files.length) {
  console.error('No .glb files found in', modelsDir)
  process.exit(1)
}

console.log('Found models:', files)

for (const file of files) {
  const inPath = path.join(modelsDir, file)
  const base = file.replace(/\.glb$/i, '')
  const resized = path.join(modelsDir, `${base}.resized.glb`)
  const draco = path.join(modelsDir, `${base}.draco.glb`)
  const out = path.join(modelsDir, `${base}.opt.glb`)

  try {
    console.log('Inspecting', file)
    execSync(`npx @gltf-transform/cli inspect "${inPath}"`, { stdio: 'inherit' })

    console.log('Resizing textures to max 2048...')
    execSync(`npx @gltf-transform/cli resize --width=2048 "${inPath}" "${resized}"`, { stdio: 'inherit' })

    console.log('Applying Draco compression...')
    execSync(`npx @gltf-transform/cli draco "${resized}" "${draco}"`, { stdio: 'inherit' })

    console.log('Final optimize (inspect)...')
    execSync(`npx @gltf-transform/cli inspect "${draco}"`, { stdio: 'inherit' })

    // move draco to .opt.glb to keep naming simple
    fs.renameSync(draco, out)
    fs.unlinkSync(resized)

    console.log('Optimized:', out)
  } catch (err) {
    console.error('Optimization failed for', file)
    console.error(err.message || err)
  }
}

console.log('Done. Review optimized files (*.opt.glb) before replacing originals.')
