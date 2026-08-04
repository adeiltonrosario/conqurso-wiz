import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Concurseiro Inteligente" },
      {
        name: "description",
        content:
          "Entre com e-mail e senha ou com o Google para sincronizar seu acervo, revisão espaçada e trilha de estudo na nuvem.",
      },
      { property: "og:title", content: "Entrar — Concurseiro Inteligente" },
      {
        property: "og:description",
        content: "Acesse sua conta e estude com o mesmo acervo no celular e no tablet.",
      },
    ],
  }),
  component: Auth,
});

type Modo = "entrar" | "criar" | "recuperar";

function Auth() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [avisoEmail, setAvisoEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/trilha", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void navigate({ to: "/trilha", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setAvisoEmail(false);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      } else if (modo === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin, data: { nome } },
        });
        if (error) throw error;
        if (!data.session) {
          setAvisoEmail(true);
          toast.success("Confira seu e-mail para confirmar o cadastro.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de redefinição para seu e-mail.");
        setModo("entrar");
      }
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível continuar.");
    } finally {
      setOcupado(false);
    }
  }

  async function google() {
    setOcupado(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setOcupado(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/trilha", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="font-display text-center text-sm font-bold tracking-tight">
          Concurseiro <span className="text-accent">Inteligente</span>
        </p>
        <h1 className="mt-4 text-center text-2xl font-bold">
          {modo === "entrar" ? "Entrar na sua conta" : modo === "criar" ? "Criar conta" : "Recuperar senha"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Seu acervo, revisão e trilha ficam salvos na nuvem e aparecem em qualquer aparelho.
        </p>

        <form onSubmit={enviar} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5 shadow-card">
          {modo === "criar" && (
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como quer ser chamado" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          {modo !== "recuperar" && (
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                minLength={6}
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="mínimo de 6 caracteres"
              />
            </div>
          )}

          {avisoEmail && (
            <p className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              <Mail className="mt-0.5 size-4 shrink-0" />
              Enviamos um link de confirmação. Depois de confirmar, volte aqui e entre com e-mail e senha.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={ocupado}>
            {ocupado ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            {modo === "entrar" ? "Entrar" : modo === "criar" ? "Criar conta" : "Enviar link"}
          </Button>

          {modo !== "recuperar" && (
            <>
              <div className="relative py-1 text-center">
                <span className="relative z-10 bg-card px-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  ou
                </span>
                <span className="absolute inset-x-0 top-1/2 -z-0 border-t border-border" />
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={google} disabled={ocupado}>
                Continuar com o Google
              </Button>
            </>
          )}
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          {modo === "entrar" && (
            <>
              <button type="button" className="text-primary underline" onClick={() => setModo("criar")}>
                Não tenho conta — criar agora
              </button>
              <br />
              <button type="button" className="text-muted-foreground underline" onClick={() => setModo("recuperar")}>
                Esqueci minha senha
              </button>
            </>
          )}
          {modo !== "entrar" && (
            <button type="button" className="text-primary underline" onClick={() => setModo("entrar")}>
              Já tenho conta — entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
