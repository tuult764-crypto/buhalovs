 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const phases = [
  { title: "Дотор минь юу байна вэ?", sub: "Юуг ч нуух шаардлагагүй. Дотроо байгаа бүхнээ бич.", days: "1–2 дахь өдөр" },
  { title: "Буруутныг өөрөөсөө хайх", sub: "Бусдад чиглэсэн бодлоо өөртөө чиглүүлж ажигла.", days: "3 дахь өдөр" },
  { title: "Бодлоо шалгая", sub: "Нэг нэгээр нь сонгож, бодлынхоо эх сурвалжийг судал.", days: "4–25 дахь өдөр" },
  { title: "Миний хүсэл", sub: "Өөрийн хүсэл, хийхийг хүссэн зүйлээ картад буулга.", days: "4–25 дахь өдөр" },
  { title: "Миний аяллын төгсгөл", sub: "Эргэн харж, өөрийн ойлголтоо нэгтгэ.", days: "26–30 дахь өдөр" }
];

export default function Journey({ email }: { email: string }) {
  const [entries, setEntries] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("journal_entries").select("content").eq("phase", 1).order("created_at", { ascending: true });
        if (error) throw error;
        if (alive && data) setEntries(data.map(row => row.content));
      } catch (e) {
        if (alive) setMessage(e instanceof Error ? e.message : "Мэдээлэл уншиж чадсангүй.");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  async function addEntry() {
    const content = draft.trim();
    if (!content) return;
    setSaving(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("journal_entries").insert({ phase: 1, content });
      if (error) throw error;
      setEntries(prev => [...prev, content]);
      setDraft("");
      setMessage("Тэмдэглэл хадгалагдлаа.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Хадгалж чадсангүй.");
    } finally { setSaving(false); }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main className="journey-page">
      <header className="journey-top"><a className="brand" href="/">БУХАЛ ӨВС</a><div className="user-tools"><span>{email}</span><button onClick={signOut}>Гарах</button></div></header>
      <section className="journey-wrap">
        <div className="eyebrow">ЧИНИЙ ХУВИЙН АЯЛАЛ</div>
        <h1>Сайн байна уу, аялагч минь.</h1>
        <p className="lead">Өөрийнхөө хэмнэлээр урагшлаарай. Энд бичсэн зүйлс зөвхөн чамд харагдана.</p>
        <div className="phase-track">{phases.map((p, i) => <button key={p.title} className={`phase-dot ${phase === i ? "active" : ""} ${i < phase ? "passed" : ""}`} onClick={() => setPhase(i)}><span>{i + 1}</span><small>{p.title}</small></button>)}</div>
        <section className="work-panel">
          <div className="panel-meta">{phases[phase].days} · ҮЕ ШАТ {phase + 1}</div>
          <h2>{phases[phase].title}</h2>
          <p>{phases[phase].sub}</p>
          {phase === 0 ? <>
            <div className="prompt-box">“Хэний ч өмнө өөрийгөө зөвтгөх шаардлагагүй. Зөв, буруу гэж санаа зоволгүйгээр дотор байгаа бүхнээ бич.”</div>
            <label className="journal-label" htmlFor="entry">Одоо чамайг юу бухимдуулж байна вэ?</label>
            <textarea id="entry" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Би ... зүйлд бухимдаж байна." rows={4} />
            <button className="gold-button" onClick={addEntry} disabled={saving || !draft.trim()}>{saving ? "Хадгалж байна..." : "Тэмдэглэл нэмэх"}</button>
            <div className="entries"><h3>Миний тэмдэглэл · {entries.length}</h3>{loading ? <p>Уншиж байна...</p> : entries.length === 0 ? <p>Энд чиний бичсэн зүйлс харагдана.</p> : entries.map((entry, i) => <article className="entry" key={`${i}-${entry.slice(0, 12)}`}><span>{String(i + 1).padStart(2, "0")}</span>{entry}</article>)}</div>
          </> : <div className="coming-soon"><div className="lock-symbol">✧</div><h3>Энэ ертөнцийг бүтээж байна</h3><p>Энэ үе шатны дэлгэрэнгүй үйлдлүүд дараагийн хөгжүүлэлтийн хэсэгт нэмэгдэнэ. Таны аяллын үндсэн бүтэц бэлэн байна.</p></div>}
          {message && <div className="notice">{message}</div>}
        </section>
      </section>
    </main>
  );
}