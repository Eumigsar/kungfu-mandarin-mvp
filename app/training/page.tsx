'use client'

import { useEffect, useMemo, useState } from 'react'

type TrainingMode = 'zh_to_pt' | 'pt_to_zh'

type Item = {
	id: string
	hanzi: string
	pinyin: string
	pt: string
}

type NextPayload = {
	mode: TrainingMode
	item: Item
}

function normalize(s: string) {
	return (s || '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
}

function normalizePt(s: string) {
	return normalize(s)
		.replace(/[()]/g, '')
		.replaceAll('/', ' ')
		.replaceAll('-', ' ')
		.replace(/[^a-z\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function normalizePinyin(s: string) {
	// aceita: com tons, sem tons, com números
	return normalize(s)
		.replaceAll(' ', '')
		.replace(/[1-4]/g, '')
		.replace(/[·•\-_.]/g, '')
}

function splitPtSynonyms(pt: string) {
	return (pt || '')
		.split(';')
		.map((x) => x.trim())
		.filter(Boolean)
}

function acceptableHanziForms(hanzi: string) {
	const raw = (hanzi || '').trim()
	const parts = raw.split('/').map((p) => p.trim()).filter(Boolean)
	const forms = new Set<string>()
	for (const p of parts) forms.add(p)
	if (parts.length > 1) forms.add(parts.join(''))
	if (parts.length === 0 && raw) forms.add(raw)
	return Array.from(forms)
}

function isCorrectZhToPt(answer: string, item: Item) {
	const u = normalizePt(answer)
	if (!u) return false
	const syns = splitPtSynonyms(item.pt).map(normalizePt)
	return syns.some((s) => s && (u === s || u.includes(s) || s.includes(u)))
}

function isCorrectPtToZh(answer: string, item: Item) {
	const uRaw = (answer || '').trim()
	const uPy = normalizePinyin(uRaw)
	const uHanzi = normalize(uRaw).replaceAll(' ', '')

	if (uPy && uPy === normalizePinyin(item.pinyin)) return true

	const forms = acceptableHanziForms(item.hanzi)
		.map((h) => normalize(h).replaceAll(' ', ''))
	return uHanzi && forms.includes(uHanzi)
}

export default function TrainingPage() {
	const [loading, setLoading] = useState(false)
	const [payload, setPayload] = useState<NextPayload | null>(null)
	const [answer, setAnswer] = useState('')
	const [feedback, setFeedback] = useState<
		| null
		| {
			ok: boolean
			accepted: string
			reveal: { hanzi: string; pinyin: string; pt: string }
		}
	>(null)

	const prompt = useMemo(() => {
		if (!payload) return ''
		const { mode, item } = payload
		if (mode === 'zh_to_pt') {
			return `O que significa: ${item.hanzi} (${item.pinyin})?`
		}
		return `Como se diz em mandarim: ${splitPtSynonyms(item.pt)[0] || item.pt}?`
	}, [payload])

	async function loadNext() {
		setLoading(true)
		setFeedback(null)
		setAnswer('')
		try {
			const res = await fetch('/api/training/next', { cache: 'no-store' })
			const json = (await res.json()) as NextPayload | { error: string }
			if ('error' in json) throw new Error(json.error)
			setPayload(json)
		} catch (e: any) {
			alert(String(e?.message || e))
		} finally {
			setLoading(false)
		}
	}

	function submit() {
		if (!payload) return
		const { mode, item } = payload
		const ok = mode === 'zh_to_pt'
			? isCorrectZhToPt(answer, item)
			: isCorrectPtToZh(answer, item)

		const accepted =
			mode === 'zh_to_pt'
				? splitPtSynonyms(item.pt).join(' / ')
				: `${item.pinyin} / ${acceptableHanziForms(item.hanzi).join(' / ')}`

		setFeedback({
			ok,
			accepted,
			reveal: { hanzi: item.hanzi, pinyin: item.pinyin, pt: item.pt },
		})
	}

	useEffect(() => {
		loadNext()
	}, [])

	return (
		<main style= maxWidth: 900, margin: '32px auto', padding: 16, lineHeight: 1.5 >
			<h1 style= margin: 0 >Dojo — Treino</h1>
			<p style= opacity: 0.75, marginTop: 8 >
				Atividade v0: ZH → PT e PT → ZH. (Sem salvar progresso ainda.)
			</p>

			<div
				style=
					border: '1px solid rgba(0,0,0,0.12)',
					borderRadius: 12,
					padding: 16,
					marginTop: 16,
				
			>
				<div style= fontWeight: 800, fontSize: 18 >{prompt || 'Carregando…'}</div>

				<div style= display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginTop: 12 >
					<input
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						placeholder={payload?.mode === 'zh_to_pt' ? 'Digite em português…' : 'Digite pinyin ou hanzi…'}
						style= padding: 12, borderRadius: 10, border: '1px solid rgba(0,0,0,0.18)' 
						onKeyDown={(e) => {
							if (e.key === 'Enter') submit()
						}}
					/>
					<button
						onClick={submit}
						disabled={!payload || loading}
						style= padding: '10px 14px', borderRadius: 10, fontWeight: 800 
					>
						Responder
					</button>
				</div>

				{feedback && (
					<div style= marginTop: 14 >
						<div
							style=
								display: 'inline-block',
								padding: '6px 10px',
								borderRadius: 999,
								border: '1px solid rgba(0,0,0,0.18)',
								background: feedback.ok ? 'rgba(14,107,77,0.12)' : 'rgba(214,167,74,0.12)',
								fontWeight: 900,
							
						>
							{feedback.ok ? '✔ Correto' : '✖ Incorreto'}
						</div>

						<div style= marginTop: 10 >
							<div style= fontSize: 20, fontWeight: 900 >{feedback.reveal.hanzi}</div>
							<div style= marginTop: 4 >{feedback.reveal.pinyin}</div>
							<div style= marginTop: 4, opacity: 0.8 >{feedback.reveal.pt}</div>
						</div>

						<div style= marginTop: 10, opacity: 0.75 >
							Aceito: <span style= fontFamily: 'monospace' >{feedback.accepted}</span>
						</div>

						<div style= marginTop: 12 >
							<button
								onClick={loadNext}
								disabled={loading}
								style= padding: '10px 14px', borderRadius: 10, fontWeight: 800 
							>
								Próximo
							</button>
						</div>
					</div>
				)}
			</div>

			<div style= marginTop: 16, opacity: 0.7, fontSize: 13 >
				Dica: em PT → ZH, você pode responder com pinyin com números (ex.: <code>lao3shi1</code>)
				 ou sem tons (<code>laoshi</code>) ou com hanzi (<code>老师</code>).
			</div>
		</main>
	)
}
