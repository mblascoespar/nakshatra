/**
 * Downloads one public-domain deity image per month from Wikimedia Commons
 * into frontend/public/images/deities/{month}.jpg
 *
 * Uses the Wikimedia Commons API to resolve correct thumbnail URLs.
 * Run once from the project root:  node scripts/download-deity-images.js
 */

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const OUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'images', 'deities')
fs.mkdirSync(OUT_DIR, { recursive: true })

const IMAGES = [
  {
    file: 'jan.jpg', deity: 'Surya', festival: 'Makara Sankranti',
    wikiFile: 'Surya the sun deity driving in his chariot. Gouache drawing. Wellcome V0045217.jpg',
  },
  {
    file: 'feb.jpg', deity: 'Saraswati', festival: 'Vasant Panchami',
    wikiFile: 'Raja_Ravi_Varma,_Goddess_Saraswati.jpg',
  },
  {
    file: 'mar.jpg', deity: 'Shiva', festival: 'Maha Shivaratri',
    wikiFile: 'Shiva_Vishvarupa.jpg',
  },
  {
    file: 'apr.jpg', deity: 'Rama', festival: 'Rama Navami',
    wikiFile: 'Bharata welcoming Rama, Sita, Lakshmana and Hanuman to Ayodhya by Raja Ravi Varma.jpg',
  },
  {
    file: 'may.jpg', deity: 'Lakshmi', festival: 'Akshaya Tritiya',
    wikiFile: 'Siddha Lakshmi - Google Art Project.jpg',
  },
  {
    file: 'jun.jpg', deity: 'Murugan', festival: 'Skanda Jayanti',
    wikiFile: 'Murugan by Raja Ravi Varma.jpg',
  },
  {
    file: 'jul.jpg', deity: 'Vishnu', festival: 'Ashadhi Ekadashi',
    wikiFile: 'Vishnu_in_his_complete_form.jpg',
  },
  {
    file: 'aug.jpg', deity: 'Krishna', festival: 'Janmashtami',
    wikiFile: 'The Flute Player-Krishna.jpg',
  },
  {
    file: 'sep.jpg', deity: 'Durga', festival: 'Navaratri',
    wikiFile: 'Durga_Mahisasuramardini.JPG',
  },
  {
    file: 'oct.jpg', deity: 'Hanuman', festival: 'Vijaya Dashami',
    wikiFile: 'Hanuman painting c1920.jpg',
  },
  {
    file: 'nov.jpg', deity: 'Ganesha', festival: 'Karthika Masa',
    wikiFile: 'Tanjore Painting Vinayaka 2.jpg',
  },
  {
    file: 'dec.jpg', deity: 'Surya', festival: 'Uttarayana',
    wikiFile: 'Surya the sun deity driving in his chariot. Gouache drawing. Wellcome V0045217.jpg',
  },
]

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NakshatraCalendar/1.0 (github.com/nakshatra)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function httpsDownload(url, destPath, redirects = 0) {
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'))
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NakshatraCalendar/1.0 (github.com/nakshatra)' } }, (res) => {
      if ([301, 302, 307].includes(res.statusCode)) {
        return httpsDownload(res.headers.location, destPath, redirects + 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const file = fs.createWriteStream(destPath)
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      file.on('error', reject)
    }).on('error', reject)
  })
}

async function getThumbUrl(wikiFile, width = 900) {
  const encoded = encodeURIComponent(`File:${wikiFile}`)
  const apiUrl  = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json`
  const { status, body } = await httpsGet(apiUrl)
  if (status !== 200) throw new Error(`API returned ${status}`)
  const data  = JSON.parse(body)
  const page  = Object.values(data.query.pages)[0]
  if (!page.imageinfo) throw new Error(`File not found on Commons: ${wikiFile}`)
  return page.imageinfo[0].thumburl || page.imageinfo[0].url
}

async function main() {
  console.log(`Output: ${OUT_DIR}\n`)

  for (const img of IMAGES) {
    const dest = path.join(OUT_DIR, img.file)
    if (fs.existsSync(dest)) {
      console.log(`  skip  ${img.file}  (exists)`)
      continue
    }
    // Clean up any leftover .missing sentinel
    if (fs.existsSync(dest + '.missing')) fs.unlinkSync(dest + '.missing')

    process.stdout.write(`  fetch ${img.file}  (${img.deity})...`)
    try {
      const thumbUrl = await getThumbUrl(img.wikiFile)
      await delay(500)
      await httpsDownload(thumbUrl, dest)
      const kb = Math.round(fs.statSync(dest).size / 1024)
      console.log(` ok  (${kb} KB)`)
    } catch (err) {
      console.log(` FAILED: ${err.message}`)
    }
    await delay(1500)   // be polite to Wikimedia's servers
  }

  console.log('\nDone.')
}

main()
