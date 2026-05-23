# Dataset plan — HSK 3.0 (Band 1) — Option 1

**Decision:** Use only the official Band 1 word list (300 words). Do NOT add Band 2 words.

## What “300–500” means under Option 1
- Keep **300 words** fixed.
- Add depth via:
  - 2–4 example sentences per item
  - multiple activity templates
  - accepted answers (PT synonyms + pinyin variants + hanzi variants)
  - dojo context lines

## Seed file format
See `data/hsk3_band1_300.json`.

## Import
Run:
- `npm install`
- `npm run seed:hsk3`

## Next step
Replace the placeholder dataset with the full 300-word Band 1 list (from official syllabus source) and expand examples.
