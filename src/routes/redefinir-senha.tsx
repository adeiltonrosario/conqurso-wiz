import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Nova senha — Concurseiro Inteligente" },
      {
        name: "description",
        content: "Defina uma nova senha para voltar a acessar seu acervo de estudo na nuvem.",
      },
      { property: "og:title", content: "Nova senha — Concurseiro Inteligente" },
      { property: "og:description", content: "Crie uma nova senha de acesso à sua conta de estudo." },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setPronto(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setPronto(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha atualizada.");
      void navigate({ to: "/trilha", replace: true });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível atualizar a senha.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form onSubmit={salvar} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <h1 className="text-xl font-bold">Definir nova senha</h1>
        {!pronto && (
          <p className="text-sm text-muted-foreground">
            Abra esta página pelo link enviado no seu e-mail para poder trocar a senha.
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="nova">Nova senha</Label>
          <Input
            id="nova"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="mínimo de 6 caracteres"
          />
        </div>
        <Button type="submit" className="w-full" disabled={ocupado || !pronto}>
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          Salvar senha
        </Button>
      </form>
    </div>
  );
}
