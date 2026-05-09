import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, ShieldCheck, Bell, Mail, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileQuery, useSuspendProfile } from '@application/profiles/use-profiles';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Card, CardBody, CardHeader } from '@presentation/components/ui/Card';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { Skeleton } from '@presentation/components/ui/Skeleton';
import { ErrorState } from '@presentation/components/feedback/ErrorState';
import { SuspendProfileModal } from './SuspendProfileModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate } from '@shared/lib/format';

export default function ProfileDetailPage() {
  const { profileId = '' } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const detail = useProfileQuery(profileId);
  const suspendM = useSuspendProfile();
  const [openSuspend, setOpenSuspend] = useState(false);

  if (detail.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/profiles')}>
          Retour
        </Button>
        <ErrorState error={detail.error ?? new Error('Profil introuvable')} onRetry={() => detail.refetch()} />
      </div>
    );
  }

  const { profile, auth } = detail.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link to="/profiles" className="hover:text-foreground">
            ← Tous les profils
          </Link>
        }
        title={profile.username ?? profile.full_name ?? 'Profil'}
        description={`ID • ${profile.id}`}
        actions={
          <>
            <Link to={`/notifications?user_id=${profile.id}`}>
              <Button variant="secondary" leftIcon={<Bell className="h-4 w-4" />}>
                Notifier
              </Button>
            </Link>
            <Button
              variant={profile.is_suspended ? 'primary' : 'danger'}
              leftIcon={profile.is_suspended ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              onClick={() => setOpenSuspend(true)}
            >
              {profile.is_suspended ? 'Réactiver' : 'Suspendre'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Informations" description="Données du profil utilisateur" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Username" value={profile.username} />
            <Field label="Nom complet" value={profile.full_name} />
            <Field label="Niveau" value={profile.level != null ? `Niveau ${profile.level}` : '—'} />
            <Field label="XP total" value={profile.total_xp != null ? String(profile.total_xp) : '—'} />
            <Field label="Inscrit le" value={formatDate(profile.created_at)} />
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-muted">Statut</p>
              <div className="mt-1.5">
                {profile.is_suspended ? (
                  <Badge tone="danger">Suspendu</Badge>
                ) : (
                  <Badge tone="success">Actif</Badge>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Authentification" description="Données auth" />
          <CardBody className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted" />
              <div>
                <p className="text-2xs font-bold uppercase tracking-widest text-muted">Email</p>
                <p className="text-sm font-bold text-foreground break-all">{auth?.email ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted" />
              <div>
                <p className="text-2xs font-bold uppercase tracking-widest text-muted">Dernière connexion</p>
                <p className="text-sm font-bold text-foreground">{formatDate(auth?.last_sign_in_at)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {profile.is_suspended && (
        <Card className="border-danger/30 bg-danger/5">
          <CardBody className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-danger">
              <Shield className="h-4 w-4" /> Profil suspendu
            </div>
            <p className="text-sm">
              <span className="text-muted">Jusqu'au : </span>
              <span className="font-bold">{formatDate(profile.suspended_until)}</span>
            </p>
            {profile.suspension_reason && (
              <p className="text-sm">
                <span className="text-muted">Raison : </span>
                {profile.suspension_reason}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <SuspendProfileModal
        open={openSuspend}
        profile={profile}
        onClose={() => setOpenSuspend(false)}
        submitting={suspendM.isPending}
        onSubmit={async (input) => {
          try {
            await suspendM.mutateAsync({ id: profile.id, input });
            toast.success(input.is_suspended ? 'Profil suspendu' : 'Profil réactivé');
            setOpenSuspend(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-2xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground break-all">{value ?? '—'}</p>
    </div>
  );
}
