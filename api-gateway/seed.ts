process.env.DATABASE_URL = "postgresql://admin:adminpassword@localhost:5433/bibliotecadb?schema=public"
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const rawData = fs.readFileSync('../data-service/ARTHUR.json', 'utf-8')
  const records = JSON.parse(rawData)

  console.log(`Loaded ${records.length} records.Seeding...`)

  let processed = 0
  for (const r of records) {
    const fields = r.fields

    // mapping
    const titleArr = fields["18"] || fields["245"] || fields["200"] || []
    let title = titleArr.join(" ")
    if (!title) {
      // generic fallback title
      const allText = Object.values(fields).flat() as string[]
      title = allText.length > 0 ? allText.reduce((a, b) => a.length > b.length ? a : b) : `Registro ${r.mfn} `
    }

    const authors = (fields["10"] || fields["16"] || fields["100"] || []).join(", ")
    const publisher = (fields["30"] || fields["260"] || []).join(", ")
    const year = (fields["31"] || fields["260"] || []).join(", ")
    const isbn = (fields["20"] || fields["020"] || []).join(", ")
    const registrationNumber = (fields["180"] || []).join(", ")

    try {
      await prisma.book.upsert({
        where: { mfn: r.mfn },
        update: {},
        create: {
          mfn: r.mfn,
          title: title.substring(0, 255),
          authors: authors.substring(0, 255),
          publisher: publisher.substring(0, 255),
          year: year.substring(0, 255),
          isbn: isbn.substring(0, 255),
          subject: JSON.stringify(fields),
          registrationNumber: registrationNumber.substring(0, 255)
        }
      })
      processed++
      if (processed % 1000 === 0) console.log(`Seeded ${processed} records...`)
    } catch (e) {
      // ignore isolated errors
    }
  }

  console.log("Seeding finished successfully.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
