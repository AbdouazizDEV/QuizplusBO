import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@infrastructure/http/api-client';
import { Endpoints } from '@infrastructure/http/endpoints';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Button } from '@presentation/components/ui/Button';
import { toastApiError } from '@shared/lib/api-error-toast';

const ROLES = [
  { id: 'auteur', label: 'Auteur — prépare les brouillons' },
  { id: 'relecteur', label: 'Relecteur — valide, jamais sa propre question' },
  { id: 'host', label: 'Host — pilote le direct et voit les données habilitées' },
  { id: 'arbitre', label: 'Arbitre — recours, score et qualification' },
  { id: 'sponsor', label: 'Sponsor — agrégats seulement, aucune écriture' },
] as const;

export default function ArenaAccessPage() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]['id']>('relecteur');
  const [confirmed, setConfirmed] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [universe, setUniverse] = useState('senegal-afrique');
  const [difficulty, setDifficulty] = useState('Z0');
  const [count, setCount] = useState(2);
  const [coverage, setCoverage] = useState('');

  const grant = async () => {
    setBusy(true);
    try {
      await apiClient.post(Endpoints.arena.grantRole, { user_id: userId.trim(), role, confirmed: true });
      toast.success('Rôle Arena enregistré.');
      setConfirmed(false);
    } catch (error) {
      toastApiError(error);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await apiClient.post(Endpoints.arena.verifyIdentity(registrationId.trim()), { confirmed: true });
      toast.success('Identité marquée comme vérifiée. Le direct peut afficher le prénom et l’initiale.');
      setIdentityConfirmed(false);
    } catch (error) {
      toastApiError(error);
    } finally {
      setBusy(false);
    }
  };

  const generate = async () => {
    setBusy(true);
    try {
      const created = await apiClient.post<{ questions?: unknown[] }>(Endpoints.arena.bankGenerate, {
        author_id: userId.trim(),
        universe,
        difficulty: difficulty.trim() || 'Z0',
        count,
      });
      const drafts = Array.isArray(created.questions) ? created.questions.length : 0;
      toast.success(`${drafts} brouillon${drafts > 1 ? 's' : ''} créé${drafts > 1 ? 's' : ''}. Un autre relecteur doit les valider.`);
    } catch (error) {
      toastApiError(error);
    } finally {
      setBusy(false);
    }
  };

  const loadCoverage = async () => {
    setBusy(true);
    try {
      const report = await apiClient.get<{
        validated?: number;
        reserve?: number;
        universes?: Array<{ digital_ready?: boolean }>;
      }>(Endpoints.arena.bankCoverage);
      const ready = (report.universes ?? []).filter((item) => item.digital_ready).length;
      setCoverage(`${report.validated ?? 0} validées, ${report.reserve ?? 0} en réserve, ${ready}/5 univers prêts pour le digital.`);
    } catch (error) {
      toastApiError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accès Arena"
        description="Le contrôle Quizz+ attribue les rôles. Un sponsor ne reçoit ni coordonnées, ni droit de modifier questions, scores ou qualifications."
      />
      <section className="max-w-xl space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#1A1A2E]">Attribuer un rôle</h2>
        <label className="block text-sm font-semibold">
          Identifiant du joueur
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="UUID du profil"
          />
        </label>
        <label className="block text-sm font-semibold">
          Rôle
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={role}
            onChange={(event) => setRole(event.target.value as (typeof ROLES)[number]['id'])}
          >
            {ROLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
          Je confirme cette attribution.
        </label>
        <Button type="button" disabled={busy || !confirmed || userId.trim().length < 30} onClick={() => void grant()}>
          Enregistrer le rôle
        </Button>
      </section>
      <section className="max-w-xl space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#1A1A2E]">Vérifier une identité pour le direct</h2>
        <p className="text-sm text-slate-600">
          Après vérification, Arena Live affiche le prénom et l’initiale du nom. Le téléphone, l’e-mail et le justificatif restent cachés.
        </p>
        <label className="block text-sm font-semibold">
          Identifiant d’inscription
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={registrationId}
            onChange={(event) => setRegistrationId(event.target.value)}
            placeholder="UUID de l’inscription"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={identityConfirmed} onChange={(event) => setIdentityConfirmed(event.target.checked)} />
          L’identité a été vérifiée.
        </label>
        <Button
          type="button"
          disabled={busy || !identityConfirmed || registrationId.trim().length < 30}
          onClick={() => void verify()}
        >
          Marquer l’identité vérifiée
        </Button>
      </section>
      <section className="max-w-xl space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-[#1A1A2E]">Générer des brouillons</h2>
        <p className="text-sm text-slate-600">
          Groq rédige au format déjà utilisé : question, réponses A à D, bonne réponse et fun fact. Chaque texte arrive en brouillon. L’auteur indiqué doit déjà avoir le rôle auteur, et ne pourra pas valider ses propres questions.
        </p>
        <label className="block text-sm font-semibold">
          Univers
          <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={universe} onChange={(event) => setUniverse(event.target.value)}>
            <option value="senegal-afrique">Sénégal et Afrique</option>
            <option value="monde">Monde, Histoire et Actualités</option>
            <option value="sciences">Sciences, Tech et Innovation</option>
            <option value="business">Business, Société et Vie pratique</option>
            <option value="culture">Culture, Médias, Sport et Divertissement</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">
            Difficulté
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            Nombre
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" type="number" min={1} max={8} value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </label>
        </div>
        <Button type="button" disabled={busy || userId.trim().length < 30} onClick={() => void generate()}>
          Générer
        </Button>
        <Button type="button" disabled={busy} onClick={() => void loadCoverage()}>
          Voir la couverture
        </Button>
        {coverage ? <p className="text-sm font-semibold text-[#1A1A2E]">{coverage}</p> : null}
      </section>
    </div>
  );
}
