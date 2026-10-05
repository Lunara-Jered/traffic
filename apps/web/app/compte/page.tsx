"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { useWatchlist } from "@/lib/watchlist";

type Account = {
  id: string;
  email: string;
  profiles: { id: string; name: string; isKids: boolean }[];
  subscription: { plan: string; status: string; currentPeriodEnd: string | null; hasBillingAccount: boolean } | null;
};

async function readAccount(): Promise<Account | null> {
  const response = await fetch("/api/account");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Impossible de charger le compte.");
  return (await response.json()).user as Account;
}

export default function AccountPage() {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const titles = useWatchlist((state) => state.titles);
  const queryClient = useQueryClient();
  const accountQuery = useQuery({ queryKey: ["account"], queryFn: readAccount });
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("paiement");
    if (result === "succes") setNotice("Paiement reçu. Votre abonnement sera activé après confirmation par Stripe.");
    if (result === "annule") setNotice("Paiement annulé. Aucun abonnement n’a été modifié.");
  }, []);

  const authentication = useMutation({
    mutationFn: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const response = await fetch(register ? "/api/auth/register" : "/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, profileName: name || "Moi" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Connexion impossible.");
      return result;
    },
    onSuccess: async () => { setError(""); setNotice("Session ouverte."); setPassword(""); await queryClient.invalidateQueries({ queryKey: ["account"] }); },
    onError: (reason: Error) => setError(reason.message),
  });

  const billing = useMutation({
    mutationFn: async (action: { kind: "checkout"; plan: "STANDARD" | "PREMIUM" } | { kind: "portal" | "logout" }) => {
      const response = await fetch(action.kind === "logout" ? "/api/auth/logout" : `/api/billing/${action.kind}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, ...(action.kind === "checkout" ? { body: JSON.stringify({ plan: action.plan }) } : {}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Action impossible.");
      return result;
    },
    onSuccess: async (result) => {
      if (result.url) window.location.assign(result.url);
      else { await queryClient.invalidateQueries({ queryKey: ["account"] }); setNotice("Session fermée."); }
    },
    onError: (reason: Error) => setError(reason.message),
  });

  const createProfile = useMutation({
    mutationFn: async () => {
      const profileName = window.prompt("Nom du nouveau profil");
      if (!profileName?.trim()) return;
      const response = await fetch("/api/profiles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profileName }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Profil impossible à créer.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account"] }),
    onError: (reason: Error) => setError(reason.message),
  });

  const removeProfile = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Suppression impossible.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account"] }),
    onError: (reason: Error) => setError(reason.message),
  });

  return (
    <main className="account-page">
      <header className="account-header"><Link className="brand" href="/">STREAM<span>FLIX</span></Link><Link href="/catalogue">Retour au catalogue</Link></header>
      <div className="account-content">
        <div className="eyebrow">Votre espace personnel</div><h1 className="display account-title">Mon compte</h1>
        {notice && <p className="account-message">{notice}</p>}
        {error && <p className="account-error" role="alert">{error}</p>}
        {accountQuery.isLoading && <p className="empty-state">Chargement du compte…</p>}
        {accountQuery.data ? <>
          <section className="account-section"><div className="account-section-heading"><div><h2>Profil du compte</h2><p>{accountQuery.data.email}</p></div><button className="text-button" type="button" onClick={() => billing.mutate({ kind: "logout" })}>Déconnexion</button></div>
            <div className="profile-list">{accountQuery.data.profiles.map((profile) => <div className="profile-row" key={profile.id}><span className="profile-avatar">{profile.isKids ? "◉" : profile.name.slice(0, 1).toUpperCase()}</span><span>{profile.name}{profile.isKids ? " · Enfant" : ""}</span>{accountQuery.data!.profiles.length > 1 && <button className="text-button" type="button" onClick={() => removeProfile.mutate(profile.id)}>Supprimer</button>}</div>)}</div>
            <button className="button button-secondary" type="button" disabled={accountQuery.data.profiles.length >= 5} onClick={() => createProfile.mutate()}>＋ Ajouter un profil ({accountQuery.data.profiles.length}/5)</button>
          </section>
          <section className="account-section"><div className="account-section-heading"><div><h2>Votre abonnement</h2><p>Offre actuelle : <strong>{accountQuery.data.subscription?.plan ?? "FREE"}</strong> · {accountQuery.data.subscription?.status ?? "ACTIVE"}</p></div>{accountQuery.data.subscription?.hasBillingAccount && <button className="text-button" type="button" onClick={() => billing.mutate({ kind: "portal" })}>Gérer la facturation</button>}</div>
            <div className="plan-list">{[{ id: "STANDARD" as const, title: "Standard", price: "10,99 €", detail: "Full HD · 2 écrans" }, { id: "PREMIUM" as const, title: "Premium", price: "15,99 €", detail: "4K UHD · 4 écrans" }].map((plan) => <article className="plan-row" key={plan.id}><div><h3>{plan.title}</h3><p>{plan.detail}</p></div><strong>{plan.price}<small> / mois</small></strong><button className="button button-primary" type="button" onClick={() => billing.mutate({ kind: "checkout", plan: plan.id })}>Choisir</button></article>)}</div>
          </section>
          <section className="account-section"><h2>Ma liste</h2>{titles.length ? <div className="saved-titles">{titles.map((title) => <span key={title}>{title}</span>)}</div> : <p className="empty-state">Les titres ajoutés apparaîtront ici.</p>}</section>
        </> : !accountQuery.isLoading && <section className="account-login"><h2>{register ? "Créer votre compte" : "Ravi de vous revoir"}</h2><p>Retrouvez vos films, vos profils et votre abonnement.</p><form onSubmit={(event) => authentication.mutate(event)}>
          {register && <label>Nom du profil<input autoComplete="nickname" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} /></label>}
          <label>Adresse e-mail<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Mot de passe<input type="password" autoComplete={register ? "new-password" : "current-password"} minLength={register ? 12 : 1} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="button button-primary" type="submit" disabled={authentication.isPending}>{authentication.isPending ? "Veuillez patienter…" : register ? "Créer mon compte" : "Se connecter"}</button>
        </form><button className="text-button auth-switch" type="button" onClick={() => { setRegister(!register); setError(""); }}>{register ? "Déjà un compte ? Se connecter" : "Nouveau ici ? Créer un compte"}</button></section>}
      </div>
    </main>
  );
}