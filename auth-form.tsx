 "use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push("/journey");
          router.refresh();
        } else {
          setMessage("Бүртгэл үүслээ. Имэйл хаягтаа ирсэн баталгаажуулах холбоосыг нээнэ үү.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/journey");
        router.refresh();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="back-link">← Нүүр хуудас</Link>
      <section className="auth-card">
        <div className="eyebrow">БУХАЛ ӨВС · 30 ХОНОГИЙН АЯЛАЛ</div>
        <h1>{mode === "login" ? "Аялалдаа буцаж ирлээ." : "Аяллаа эхлүүлье."}</h1>
        <p>{mode === "login" ? "Өмнөх тэмдэглэл, аяллаа үргэлжлүүлээрэй." : "Өөрийн хувийн орон зайг үүсгээрэй."}</p>
        <form onSubmit={submit}>
          <label>Имэйл хаяг<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></label>
          <label>Нууц үг<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Дор хаяж 8 тэмдэгт" /></label>
          <button className="gold-button full" disabled={busy}>{busy ? "Түр хүлээнэ үү..." : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}</button>
        </form>
        {message && <div className="notice" role="status">{message}</div>}
        <div className="switch-auth">{mode === "login" ? <>Бүртгэлгүй юу? <Link href="/signup">Бүртгүүлэх</Link></> : <>Бүртгэлтэй юу? <Link href="/login">Нэвтрэх</Link></>}</div>
        <small>Таны тэмдэглэл зөвхөн таны бүртгэлд хадгалагдана.</small>
      </section>
    </main>
  );
}