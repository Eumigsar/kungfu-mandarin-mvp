import Link from 'next/link'

const pageStyle: React.CSSProperties = {
	maxWidth: 960,
	margin: '40px auto',
	padding: 16,
	lineHeight: 1.5,
	fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
}

export default function Home() {
	return (
		<main style={pageStyle}>
			<h1>Kung Fu Mandarin (MVP real)</h1>
			<p>
				Universo: <strong>Kung Fu / Dojo</strong> • Escopo:{' '}
				<strong>HSK1 only (por enquanto)</strong> • Chat: PT + Mandarim.
			</p>
			<ul>
				<li>
					<Link href="/training">Ir para o treino (v0)</Link>
				</li>
				<li>Próximo: integrar Supabase + seed 300 itens (HSK 3.0 Band 1)</li>
				<li>Próximo: chat do Mestre Liang (OpenAI) com guardrails HSK1</li>
				<li>Próximo: motor de atividades + SRS + anti-repetição</li>
			</ul>
		</main>
	)
}
