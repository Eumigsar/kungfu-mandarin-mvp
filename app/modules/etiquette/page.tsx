'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'

type LessonItem = {
	pt: string
	hanzi: string
	pinyin: string
	example: { hanzi: string; pinyin: string; pt: string }
	accepted: string[]
}

type Lesson = {
	id: string
	title: string
	goal: string
	items: LessonItem[]
}

type Character = {
	id: string
	name: string
	role: string
	voice: string
	bio: string
}

type EtiquetteTip = {
	id: string
	title: string
	why: string
	doInstead: string
}

type Drill = {
	id: string
	title: string
	instructions: string[]
}

type ModuleData = {
	moduleId: string
	title: string
	subtitle: string
	characters: Character[]
	lessons: Lesson[]
	etiquette: EtiquetteTip[]
	drills: Drill[]
}

const shell: CSSProperties = {
	maxWidth: 980,
	margin: '40px auto',
	padding: 16,
	lineHeight: 1.5,
	fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
}

const card: CSSProperties = {
	border: '1px solid rgba(0,0,0,0.14)',
	borderRadius: 12,
	padding: 14,
	marginTop: 12,
}

const code: CSSProperties = {
	fontFamily:
		"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
	fontSize: 12,
	padding: '2px 6px',
	borderRadius: 10,
	border: '1px solid rgba(0,0,0,0.18)',
	background: 'rgba(0,0,0,0.05)',
}

function normalize(s: string) {
	return (s || '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/\s+/g, ' ')
}

function normalizePinyin(s: string) {
	return normalize(s)
		.replaceAll(' ', '')
		.replace(/[1-4]/g, '')
		.replace(/[·•\-_.]/g, '')
}

export default function EtiquetteModulePage() {
	const [data, setData] = useState<ModuleData | null>(null)
	const [activeLessonId, setActiveLessonId] = useState<string>('greetings')
	const [answer, setAnswer] = useState('')
	const [quizIndex, setQuizIndex] = useState(0)
	const [feedback, setFeedback] = useState<string | null>(null)

	useEffect(() => {
		fetch('/modules/dojo-etiquette.json', { cache: 'no-store' })
			.then((r) => r.json())
			.then(setData)
			.catch(() => setData(null))
	}, [])

	const activeLesson = useMemo(() => {
		return data?.lessons.find((l) => l.id === activeLessonId) ?? null
	}, [data, activeLessonId])

	const activeItem = useMemo(() => {
		if (!activeLesson) return null
		return activeLesson.items[quizIndex % activeLesson.items.length]
	}, [activeLesson, quizIndex])

	function submit() {
		if (!activeItem) return
		const a = answer.trim()
		if (!a) return

		const ok =
			activeItem.accepted
				.map((x) => normalizePinyin(x))
				.includes(normalizePinyin(a)) ||
			activeItem.accepted.map((x) => normalize(x)).includes(normalize(a))

		setFeedback(
			ok
				? '✔ Correto. Mantém a calma e segue.'
				: `✖ Quase. Aceito: ${activeItem.accepted.join(' / ')}`,
		)

		if (ok) {
			setTimeout(() => {
				setAnswer('')
				setFeedback(null)
				setQuizIndex((x) => x + 1)
			}, 500)
		}
	}

	if (!data) {
		return (
			<main style={shell}>
				<h1>Módulo: Etiqueta & Convívio</h1>
				<p>Carregando…</p>
			</main>
		)
	}

	return (
		<main style={shell}>
			<h1>{data.title}</h1>
			<p style= opacity: 0.75 >{data.subtitle}</p>

			<section style={card}>
				<h2>Personagens</h2>
				<div style= display: 'grid', gap: 10 >
					{data.characters.map((c) => (
						<div key={c.id} style= border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: 12 >
							<div style= fontWeight: 800 >{c.name}</div>
							<div style= opacity: 0.75, fontSize: 13 >
								{c.role} • {c.voice}
							</div>
							<div style= marginTop: 8 >{c.bio}</div>
						</div>
					))}
				</div>
			</section>

			<section style={card}>
				<h2>Aulas</h2>
				<div style= display: 'flex', gap: 8, flexWrap: 'wrap' >
					{data.lessons.map((l) => (
						<button
							key={l.id}
							onClick={() => {
								setActiveLessonId(l.id)
								setQuizIndex(0)
								setAnswer('')
								setFeedback(null)
							}}
							style=
								padding: '10px 12px',
								borderRadius: 12,
								border: '1px solid rgba(0,0,0,0.18)',
								background: l.id === activeLessonId ? 'rgba(0,0,0,0.06)' : 'white',
								cursor: 'pointer',
								fontWeight: 800,
							
						>
							{l.title}
						</button>
					))}
				</div>

				{activeLesson && (
					<div style= marginTop: 12 >
						<div style= opacity: 0.8 >
							<strong>Objetivo:</strong> {activeLesson.goal}
						</div>

						<div style= marginTop: 12, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: 12 >
							<div style= fontWeight: 900 >Treino rápido</div>
							<div style= marginTop: 8 >
								Responda com <span style={code}>pinyin</span> ou <span style={code}>hanzi</span>.
							</div>

							{activeItem && (
								<div style= marginTop: 10 >
									<div>
										PT: <strong>{activeItem.pt}</strong>
									</div>
									<div style= opacity: 0.8 >
										Dica: {activeItem.example.hanzi} ({activeItem.example.pinyin})
									</div>

									<div style= display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' >
										<input
											value={answer}
											onChange={(e) => setAnswer(e.target.value)}
											placeholder="Digite aqui…"
											style= padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.18)', minWidth: 240 
											onKeyDown={(e) => {
												if (e.key === 'Enter') submit()
											}}
										/>
										<button
											onClick={submit}
											style= padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.18)', cursor: 'pointer', fontWeight: 900 
										>
											Responder
										</button>
									</div>

									{feedback && <div style= marginTop: 10, fontWeight: 800 >{feedback}</div>}
									<div style= marginTop: 12, opacity: 0.85 >
										<strong>Gabarito:</strong> {activeItem.hanzi} • {activeItem.pinyin}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</section>

			<section style={card}>
				<h2>Evite gafes (resumo)</h2>
				<ul>
					{data.etiquette.map((t) => (
						<li key={t.id} style= marginTop: 8 >
							<strong>{t.title}</strong>
							<div style= opacity: 0.8 >Por quê: {t.why}</div>
							<div style= opacity: 0.8 >Em vez disso: {t.doInstead}</div>
						</li>
					))}
				</ul>
			</section>

			<section style={card}>
				<h2>Drills (treinos curtos)</h2>
				{data.drills.map((d) => (
					<div key={d.id} style= marginTop: 10 >
						<div style= fontWeight: 900 >{d.title}</div>
						<ol>
							{d.instructions.map((x, i) => (
								<li key={i} style= marginTop: 6 >
									{x}
								</li>
							))}
						</ol>
					</div>
				))}
			</section>
		</main>
	)
}
