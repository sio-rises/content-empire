const sharp = require("sharp")
const path = require("path")

async function convert(input, output, width, height) {
  await sharp(input)
    .resize(width, height)
    .png()
    .toFile(output)
  console.log(`✓ ${output} (${width}x${height})`)
}

async function main() {
  const dir = path.join(__dirname, "assets")

  await convert(
    path.join(dir, "terminal_icon.svg"),
    path.join(dir, "terminal_icon.png"),
    400,
    400,
  )

  await convert(
    path.join(dir, "terminal_banner.svg"),
    path.join(dir, "terminal_banner.png"),
    1500,
    500,
  )
}

main().catch(console.error)
