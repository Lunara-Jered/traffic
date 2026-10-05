"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RightsReportPage() {
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setError("");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/rights/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactEmail: form.get("email"), rightsHolderName: form.get("holder"), contentUrl: form.get("url"), details: form.get("details"), consent: form.get("consent") === "on" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Envoi impossible.");
      setReference(result.reference);
      formElement.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Envoi impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="account-page">
      <header className="account-header"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><Link href="/">Accueil</Link></header>
      <section className="account-content report-content"><div className="eyebrow">Propriété intellectuelle</div><h1 className="display account-title">Signalement de contenu</h1><p className="hero-copy">Utilisez ce formulaire pour nous notifier d’un contenu auquel vous estimez que vos droits ont été portés atteinte. Nous conservons les informations nécessaires au traitement de votre demande.</p>
        {reference ? <div className="account-message" role="status">Signalement reçu. Votre référence est <strong>{reference}</strong>. Notre équipe doit encore l’examiner.</div> : <form className="report-form" onSubmit={submit}>
          <label>Votre adresse e-mail<input name="email" type="email" autoComplete="email" required /></label>
          <label>Titulaire des droits<input name="holder" required minLength={2} maxLength={160} /></label>
          <label>Adresse du contenu concerné<input name="url" type="url" placeholder="https://…" required /></label>
          <label>Détails et fondement de votre demande<textarea name="details" minLength={30} maxLength={5000} rows={6} required /></label>
          <label className="consent-label"><input name="consent" type="checkbox" required /> J’autorise l’utilisation de ces coordonnées pour traiter ce signalement et me recontacter.</label>
          {error && <p className="account-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Envoi…" : "Envoyer le signalement"}</button>
        </form>}
      </section>
      <footer className="site-footer"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><span>Signalement enregistré, sans préjuger de son bien-fondé.</span></footer>
    </main>
  );
}