# Kung Fu Mandarin — MVP real (HSK1 only)

MVP real da plataforma imersiva de mandarim no universo **Kung Fu / Dojo**.

## Objetivo do MVP
- **HSK1 only** (com contexto Kung Fu/Dojo)
- Chat aceita **português + mandarim** (misturado)
- Tutor sempre devolve:
	- PT
	- Hanzi
	- Pinyin
	- Frase (Hanzi + Pinyin + PT)
	- Lista de respostas aceitas
- **SRS + anti-repetição**: não repete itens, só repete após erro (retry imediato) ou por revisão agendada.

## Stack
- Next.js (App Router)
- Supabase (Auth + Postgres)
- OpenAI API
- Deploy: Vercel

## Pastas
- `docs/` documentação do produto, prompts e schema
- `data/` seeds (exemplo pequeno; expandir para 300–500)
- `app/` (placeholder) páginas do Next.js

## Próximo passo
1) Criar projeto Supabase e aplicar `docs/supabase/schema.sql`
2) Preencher `.env.local` (ver `docs/env.example`)
3) Rodar o importador (quando implementado) para popular 300–500 itens.
