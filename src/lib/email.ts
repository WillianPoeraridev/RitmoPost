import { Resend } from "resend";

// Enquanto o domínio próprio não está verificado no Resend, o sandbox onboarding@resend.dev
// só entrega para o e-mail dono da conta. Trocar por "RitmoPost <ola@ritmopost.com.br>"
// quando o domínio estiver verificado.
export const EMAIL_FROM = "RitmoPost <onboarding@resend.dev>";

export function emailLayout(inner: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a2e">
      ${inner}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:12px">RitmoPost · ritmopost.com.br</p>
    </div>
  `;
}

export function emailButton(href: string, text: string): string {
  return `
    <p style="margin:24px 0">
      <a href="${href}" style="background:#f43f5e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        ${text}
      </a>
    </p>
  `;
}

export async function sendEmail(to: string, subject: string, inner: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html: emailLayout(inner),
  });
}

type RetentionContext = {
  name: string;
  url: string;
  nextMonthName: string;
};

export type RetentionEmail = {
  key: string;
  /** Dias após o cadastro em que o e-mail deve disparar. */
  dayOffset: number;
  subject: string;
  body: (ctx: RetentionContext) => string;
};

// Sequência de retenção pós-cadastro (baseada em dias desde o signup).
export const RETENTION_EMAILS: RetentionEmail[] = [
  {
    key: "d3",
    dayOffset: 3,
    subject: "Qual tipo de post performa melhor no seu nicho?",
    body: ({ name, url }) => `
      <h2 style="color:#f43f5e">Oi, ${name}! 👋</h2>
      <p>Uma dica rápida: no Instagram, <strong>Reels e Carrossel</strong> costumam alcançar muito mais que Feed parado — por isso o RitmoPost já monta seu mês com a mistura certa.</p>
      <p>Se ainda não gerou seu calendário, leva uns 30 segundos:</p>
      ${emailButton(`${url}/gerar`, "Gerar meu calendário →")}
    `,
  },
  {
    key: "d7",
    dayOffset: 7,
    subject: "Já gerou seu calendário deste mês?",
    body: ({ name, url }) => `
      <h2 style="color:#f43f5e">${name}, o mês não espera ⏳</h2>
      <p>Cada dia sem postar é alcance que não volta. Seu calendário com 30 dias de ideias, legendas e hashtags já está a um clique.</p>
      ${emailButton(`${url}/gerar`, "Gerar agora →")}
      <p style="color:#6b7280;font-size:14px">Dica: cadastre o <strong>perfil do seu negócio</strong> antes — aí os posts saem citando seus serviços, preços e bairro.</p>
    `,
  },
  {
    key: "d20",
    dayOffset: 20,
    subject: "Semana que vem é mês novo — bora adiantar?",
    body: ({ name, url, nextMonthName }) => `
      <h2 style="color:#f43f5e">Adianta o de ${nextMonthName}, ${name} 🚀</h2>
      <p>Quem planeja com antecedência posta com consistência. Gere já o calendário de <strong>${nextMonthName}</strong> e comece o mês com tudo pronto.</p>
      ${emailButton(`${url}/gerar`, `Gerar ${nextMonthName} →`)}
    `,
  },
  {
    key: "d25",
    dayOffset: 25,
    subject: "Mês novo chegando — seu conteúdo já está pronto?",
    body: ({ name, url, nextMonthName }) => `
      <h2 style="color:#f43f5e">Falta pouco pra ${nextMonthName}! 📅</h2>
      <p>${name}, não deixa a tela em branco voltar. Em poucos segundos você tem o mês inteiro de conteúdo pronto pra copiar e postar.</p>
      ${emailButton(`${url}/gerar`, `Preparar ${nextMonthName} →`)}
    `,
  },
  {
    key: "d28",
    dayOffset: 28,
    subject: "Em uma palavra: como foi o RitmoPost esse mês?",
    body: ({ name }) => `
      <h2 style="color:#f43f5e">Queria muito te ouvir, ${name} 💜</h2>
      <p>Você está com a gente há quase um mês. Em <strong>uma palavra</strong>, como foi a experiência com o RitmoPost?</p>
      <p>É só responder este e-mail — leio todas. Seu feedback decide o que a gente constrói em seguida.</p>
    `,
  },
];
