import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
	const supabase = getSupabaseServerClient()

	// Pega um lote pequeno e escolhe aleatoriamente no servidor.
	// (Quando tivermos 300 itens, a gente implementa seleção com anti-repetição por usuário.)
	const { data, error } = await supabase
		.from('hsk_items')
		.select('id, hanzi, pinyin, pt')
		.limit(50)

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	if (!data || data.length === 0) {
		return NextResponse.json({ error: 'No items in database' }, { status: 400 })
	}

	const item = data[Math.floor(Math.random() * data.length)]
	const mode = Math.random() < 0.5 ? 'zh_to_pt' : 'pt_to_zh'

	return NextResponse.json({ mode, item })
}
