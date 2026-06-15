import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";

export default async function NovoPerfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-rose-400">
          RitmoPost
        </Link>
        <Link
          href="/perfil"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Perfis
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Cadastrar negócio</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Esses dados entram direto nos posts: serviços com preço, tom de voz e referências do
            seu bairro
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
