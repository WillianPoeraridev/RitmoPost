type PostType = "Reels" | "Carrossel" | "Feed" | "Story";
type TimeSlot = { time: string; reason: string };
type NicheSchedule = Record<PostType, TimeSlot>;

const POSTING_TIMES: Record<string, NicheSchedule> = {
  barbearia: {
    Reels:     { time: "20h–22h", reason: "homens navegam após o expediente" },
    Carrossel: { time: "12h–13h", reason: "pausa do almoço — boa leitura" },
    Feed:      { time: "20h–21h", reason: "horário de maior atividade" },
    Story:     { time: "8h–9h",   reason: "antes de ir pro trabalho" },
  },
  "salão de beleza": {
    Reels:     { time: "21h–22h", reason: "mulheres mais ativas após jantar" },
    Carrossel: { time: "20h–22h", reason: "conteúdo longo performa bem à noite" },
    Feed:      { time: "12h–13h", reason: "almoço — pausa de qualidade" },
    Story:     { time: "12h–13h", reason: "pico de visualização no meio-dia" },
  },
  estetica: {
    Reels:     { time: "21h–22h", reason: "público feminino 25-45 mais ativo à noite" },
    Carrossel: { time: "20h–21h", reason: "conteúdo educativo performa bem à noite" },
    Feed:      { time: "12h–13h", reason: "almoço — bom alcance orgânico" },
    Story:     { time: "12h–13h", reason: "pico de views de story no meio-dia" },
  },
  "personal trainer": {
    Reels:     { time: "6h–8h",   reason: "público matutino já está acordado e motivado" },
    Carrossel: { time: "7h–9h",   reason: "leitura antes ou depois do treino manhã" },
    Feed:      { time: "19h–21h", reason: "turma da noite chega da academia" },
    Story:     { time: "6h–7h",   reason: "quem treina cedo vê antes de sair" },
  },
  lanchonete: {
    Reels:     { time: "11h–12h", reason: "fome do almoço bate e o vídeo converte" },
    Carrossel: { time: "17h–19h", reason: "lanche da tarde — momento de decisão" },
    Feed:      { time: "11h–12h", reason: "antes do almoço, público escolhendo onde comer" },
    Story:     { time: "10h–11h", reason: "antecipa a fome — gera visita no almoço" },
  },
  pizzaria: {
    Reels:     { time: "17h–19h", reason: "planejamento do jantar começa aqui" },
    Carrossel: { time: "17h–19h", reason: "cardápio performa bem antes do jantar" },
    Feed:      { time: "20h–21h", reason: "quem está pedindo pizza está no Instagram" },
    Story:     { time: "16h–18h", reason: "gatilho de antecipação antes do jantar" },
  },
  "açaí": {
    Reels:     { time: "14h–16h", reason: "lanche da tarde — fome e calor" },
    Carrossel: { time: "14h–16h", reason: "combinações vendem bem nesse horário" },
    Feed:      { time: "14h–16h", reason: "pico de decisão de onde tomar açaí" },
    Story:     { time: "14h–15h", reason: "impulso de lanche da tarde" },
  },
  fotografia: {
    Reels:     { time: "19h–21h", reason: "público relaxa e se inspira à noite" },
    Carrossel: { time: "20h–22h", reason: "portfolio consome bem à noite" },
    Feed:      { time: "19h–21h", reason: "noite — momento de sonhar com o ensaio" },
    Story:     { time: "12h–13h", reason: "almoço — bom para bastidores rápidos" },
  },
  "pet shop": {
    Reels:     { time: "20h–22h", reason: "donos de pet relaxam com o bichinho à noite" },
    Carrossel: { time: "12h–13h", reason: "almoço — dicas de cuidado têm boa leitura" },
    Feed:      { time: "20h–21h", reason: "fotos de pet performam bem à noite" },
    Story:     { time: "12h–13h", reason: "pico de stories no meio-dia" },
  },
  "clínica": {
    Reels:     { time: "7h–9h",   reason: "público de saúde começa o dia cedo" },
    Carrossel: { time: "19h–21h", reason: "conteúdo de saúde lido com calma à noite" },
    Feed:      { time: "12h–13h", reason: "pausa do almoço — boa leitura preventiva" },
    Story:     { time: "7h–8h",   reason: "dicas matinais de saúde têm alta abertura" },
  },
  saas: {
    Reels:     { time: "9h–11h",  reason: "empreendedor no modo trabalho — receptivo a soluções" },
    Carrossel: { time: "14h–16h", reason: "pós-almoço — foco em aprender e otimizar" },
    Feed:      { time: "9h–11h",  reason: "manhã comercial — alta intenção de compra" },
    Story:     { time: "8h–9h",   reason: "começo do dia de trabalho" },
  },
  software: {
    Reels:     { time: "9h–11h",  reason: "empreendedor no modo trabalho — receptivo a soluções" },
    Carrossel: { time: "14h–16h", reason: "pós-almoço — foco em aprender e otimizar" },
    Feed:      { time: "9h–11h",  reason: "manhã comercial — alta intenção de compra" },
    Story:     { time: "8h–9h",   reason: "começo do dia de trabalho" },
  },
  "marketing digital": {
    Reels:     { time: "9h–11h",  reason: "profissional de marketing começa o dia procurando referências" },
    Carrossel: { time: "14h–16h", reason: "pós-almoço — momento de aprendizado" },
    Feed:      { time: "19h–21h", reason: "noite — conteúdo de resultado e inspiração" },
    Story:     { time: "8h–9h",   reason: "começo do expediente" },
  },
  "negócios digitais": {
    Reels:     { time: "9h–11h",  reason: "empreendedor digital começa o dia cedo e conectado" },
    Carrossel: { time: "19h–21h", reason: "noite — conteúdo de bastidor e resultado performa bem" },
    Feed:      { time: "9h–11h",  reason: "manhã — alta atenção e intenção" },
    Story:     { time: "12h–13h", reason: "almoço — pausa que mantém a audiência quente" },
  },
  infoproduto: {
    Reels:     { time: "19h–21h", reason: "quem quer aprender navega à noite" },
    Carrossel: { time: "19h–21h", reason: "conteúdo educativo tem maior retenção à noite" },
    Feed:      { time: "19h–21h", reason: "noite — público em modo de desenvolvimento pessoal" },
    Story:     { time: "12h–13h", reason: "almoço — bastidores e CTAs leves funcionam bem" },
  },
  "criação de conteúdo": {
    Reels:     { time: "19h–21h", reason: "criadores de conteúdo consomem referências à noite" },
    Carrossel: { time: "20h–22h", reason: "conteúdo sobre processo criativo performa bem à noite" },
    Feed:      { time: "19h–21h", reason: "noite — inspiração e bastidores convencem" },
    Story:     { time: "12h–13h", reason: "almoço — engajamento rápido em stories" },
  },
};

const DEFAULT_SCHEDULE: NicheSchedule = {
  Reels:     { time: "19h–21h", reason: "horário de maior engajamento geral no Instagram" },
  Carrossel: { time: "12h–13h", reason: "almoço — leitura mais longa performa bem" },
  Feed:      { time: "19h–21h", reason: "noite — pico de audiência ativa" },
  Story:     { time: "12h–13h", reason: "meio-dia — alto volume de views de stories" },
};

export function getPostingTime(niche: string, type: PostType): TimeSlot {
  const key = niche
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

  const exact = POSTING_TIMES[niche.toLowerCase().trim()];
  if (exact) return exact[type];

  const partial = Object.keys(POSTING_TIMES).find(
    (k) => key.includes(k.normalize("NFD").replace(/[̀-ͯ]/g, "")) ||
           k.normalize("NFD").replace(/[̀-ͯ]/g, "").includes(key)
  );
  if (partial) return POSTING_TIMES[partial][type];

  return DEFAULT_SCHEDULE[type];
}
