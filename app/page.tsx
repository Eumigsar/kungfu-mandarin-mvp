export default function Home() {
  return (
    <main style= maxWidth: 960, margin: '40px auto', padding: 16 >
      <h1>Kung Fu Mandarin (MVP real)</h1>
      <p>
        Universo: <strong>Kung Fu / Dojo</strong> • Escopo: <strong>HSK1 only</strong> • Chat: PT + Mandarim.
      </p>
      <ul>
        <li>Próximo: integrar Supabase + seed 300–500 itens</li>
        <li>Próximo: chat do Mestre Liang (OpenAI) com guardrails HSK1</li>
        <li>Próximo: motor de atividades + SRS + anti-repetição</li>
      </ul>
      <p style= opacity: 0.7 >
        Este repo é o esqueleto do MVP real. A prova de conceito offline está no repo <code>kungfu-mandarin</code>.
      </p>
    </main>
  );
}
