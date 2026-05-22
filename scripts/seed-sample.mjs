import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

// Load .env.local (node scripts do NOT load it automatically)
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
	console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
	process.exit(1)
}

const supabase = createClient(url, serviceRoleKey)

const seedPath = path.join(process.cwd(), 'data', 'hsk1_seed_sample.json')
const raw = fs.readFileSync(seedPath, 'utf-8')
const seed = JSON.parse(raw)

async function main() {
	console.log(`Seeding items from ${seedPath}...`)

	for (const item of seed) {
		const { data: insertedItems, error: itemErr } = await supabase
			.from('hsk_items')
			.insert({
				hsk_level: 1,
				hanzi: item.hanzi,
				pinyin: item.pinyin,
				pt: item.pt,
				tags: item.tags ?? [],
				dojo_context: item.dojo_context ?? null
			})
			.select('id')

		if (itemErr) {
			console.error('Insert hsk_items failed:', item.hanzi, itemErr)
			continue
		}

		const itemId = insertedItems?.[0]?.id
		if (!itemId) {
			console.error('Insert hsk_items returned no id:', item.hanzi)
			continue
		}

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

		console.log('Inserted:', item.hanzi)
	}

	console.log('Done.')
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
