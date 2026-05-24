const fs = require("fs")
const path = require("path")

const AD_CODE = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1506848814061019" crossorigin="anonymous"></script>'

const outDir = path.join(__dirname, "..", "out")

function injectAdsense(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      injectAdsense(fullPath)
    } else if (entry.name.endsWith(".html")) {
      let html = fs.readFileSync(fullPath, "utf-8")
      if (html.match(/adsbygoogle[^}]*1506848814061019/)) continue
      // Inject right after <body> tag - survives RSC hydration
      html = html.replace("<body", `${AD_CODE}<body`)
      // Also keep in head for fallback
      html = html.replace("<head>", `<head>${AD_CODE}`)
      fs.writeFileSync(fullPath, html)
      console.log(`  ✓ ${path.relative(outDir, fullPath)}`)
    }
  }
}

injectAdsense(outDir)
console.log("✓ AdSense injected into all HTML files")
