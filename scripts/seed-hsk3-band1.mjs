import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
	console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
	process.exit(1)
}

const supabase = createClient(url, serviceRoleKey)

const seedPath = path.join(process.cwd(), 'data', 'hsk3_band1_300.json')
const raw = fs.readFileSync(seedPath, 'utf-8')
const seed = JSON.parse(raw)

async function upsertItem(item) {
	// Try insert; if unique constraint hits, fetch existing row and reuse id.
	const { data: insertedItems, error: itemErr } = await supabase
		.from('hsk_items')
		.insert({
			hsk_level: 1,
			hanzi: item.hanzi,
			pinyin: item.pinyin,
			pt: item.pt,
			tags: item.tags ?? [],
			dojo_context: item.dojo_context ?? null,
		})
		.select('id')

	if (!itemErr) return insertedItems?.[0]?.id

	// If duplicate, fetch existing
	const { data: existing, error: selErr } = await supabase
		.from('hsk_items')
		.select('id')
		.eq('hanzi', item.hanzi)
		.eq('pinyin', item.pinyin)
		.limit(1)

	if (selErr) {
		console.error('Select existing failed:', item.hanzi, selErr)
		return null
	}
	return existing?.[0]?.id ?? null
}

async function main() {
	console.log(`Seeding HSK3 Band 1 items from ${seedPath}...`)

	let insertedCount = 0
	for (const item of seed) {
		const itemId = await upsertItem(item)
		if (!itemId) continue

		const examples = (item.examples ?? []).map((ex) => ({
			item_id: itemId,
			example_hanzi: ex.example_hanzi,
			example_pinyin: ex.example_pinyin,
			example_pt: ex.example_pt,
			difficulty: ex.difficulty ?? 1,
		}))

		if (examples.length) {
			const { error: exErr } = await supabase.from('hsk_examples').insert(examples)
			if (exErr) console.error('Insert hsk_examples failed:', item.hanzi, exErr)
		}

		insertedCount++
		if (insertedCount % 25 === 0) console.log(`Inserted ${insertedCount}/${seed.length}...`)
	}

	console.log(`Done. Processed ${seed.length} items.`)
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
