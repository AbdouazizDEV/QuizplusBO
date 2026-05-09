import { Link } from 'react-router-dom';
import {
  ListTodo,
  Users,
  Swords,
  Trophy,
  Layers,
  FolderTree,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuizzesQuery } from '@application/quizzes/use-quizzes';
import { useChallengesQuery } from '@application/challenges/use-challenges';
import { useCompetitionsQuery } from '@application/competitions/use-competitions';
import { useProfilesQuery } from '@application/profiles/use-profiles';
import { useLevelsQuery } from '@application/levels/use-levels';
import { useCategoriesQuery } from '@application/categories/use-categories';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Card, CardBody, CardHeader } from '@presentation/components/ui/Card';
import { Skeleton } from '@presentation/components/ui/Skeleton';
import { Badge } from '@presentation/components/ui/Badge';
import { formatNumber, truncate } from '@shared/lib/format';

interface KpiProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  to?: string;
  tone?: 'brand' | 'accent' | 'info' | 'success' | 'warning';
}

const TONE_BG: Record<NonNullable<KpiProps['tone']>, string> = {
  brand: 'from-brand-500 to-accent-400',
  accent: 'from-accent-400 to-accent-300',
  info: 'from-info to-brand-500',
  success: 'from-success to-info',
  warning: 'from-accent-400 to-warning',
};

function KpiCard({ label, value, icon: Icon, loading, to, tone = 'brand' }: KpiProps) {
  const content = (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <span
        className={`absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br ${TONE_BG[tone]} opacity-15 blur-2xl transition-opacity group-hover:opacity-30`}
        aria-hidden
      />
      <CardBody className="relative">
        <div className="flex items-center justify-between">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${TONE_BG[tone]} text-white shadow-soft`}>
            <Icon className="h-5 w-5" />
          </span>
          {to ? (
            <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          ) : null}
        </div>
        <div className="mt-4">
          <p className="text-2xs font-bold uppercase tracking-widest text-muted">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 text-3xl font-black text-foreground">{value}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );

  if (to)
    return (
      <Link to={to} className="block focus:outline-none">
        {content}
      </Link>
    );
  return content;
}

export default function DashboardPage() {
  const quizzes = useQuizzesQuery({ page: 1, limit: 5 });
  const challenges = useChallengesQuery({ page: 1, limit: 5 });
  const competitions = useCompetitionsQuery({ page: 1, limit: 5 });
  const profiles = useProfilesQuery({ page: 1, limit: 5 });
  const levels = useLevelsQuery();
  const categories = useCategoriesQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="Console admin"
        title={
          <span>
            Bienvenue 👋 <span className="quizz-gradient-text">Quizz+</span>
          </span>
        }
        description="Vue d'ensemble du contenu, des défis et de l'audience."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Quiz"
          value={formatNumber(quizzes.data?.total)}
          icon={ListTodo}
          loading={quizzes.isLoading}
          to="/quizzes"
          tone="brand"
        />
        <KpiCard
          label="Profils"
          value={formatNumber(profiles.data?.total)}
          icon={Users}
          loading={profiles.isLoading}
          to="/profiles"
          tone="info"
        />
        <KpiCard
          label="Défis"
          value={formatNumber(challenges.data?.total)}
          icon={Swords}
          loading={challenges.isLoading}
          to="/challenges"
          tone="accent"
        />
        <KpiCard
          label="Compétitions"
          value={formatNumber(competitions.data?.total)}
          icon={Trophy}
          loading={competitions.isLoading}
          to="/competitions"
          tone="warning"
        />
        <KpiCard
          label="Niveaux"
          value={formatNumber(levels.data?.length)}
          icon={Layers}
          loading={levels.isLoading}
          to="/levels"
          tone="success"
        />
        <KpiCard
          label="Catégories"
          value={formatNumber(categories.data?.length)}
          icon={FolderTree}
          loading={categories.isLoading}
          to="/categories"
          tone="brand"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Quiz récents"
            description="Les derniers quiz publiés"
            actions={
              <Link
                to="/quizzes"
                className="text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700"
              >
                Tout voir
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {quizzes.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (quizzes.data?.items?.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aucun quiz pour le moment.</p>
            ) : (
              quizzes.data!.items.map((q) => (
                <Link
                  key={q.id}
                  to={`/quizzes/${q.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 p-3 transition-colors hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-brand-500/5"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="quizz-gradient inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{q.title}</p>
                      <p className="text-2xs text-muted">{truncate(q.description, 80)}</p>
                    </div>
                  </div>
                  <Badge tone="brand">{q.difficulty_level ?? '—'}</Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Compétitions actives"
            description="Compétitions live ou planifiées"
            actions={
              <Link
                to="/competitions"
                className="text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700"
              >
                Tout voir
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {competitions.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (competitions.data?.items?.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aucune compétition pour le moment.</p>
            ) : (
              competitions.data!.items.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{c.title}</p>
                    <p className="text-2xs text-muted">{truncate(c.description, 80)}</p>
                  </div>
                  <Badge
                    tone={
                      c.status === 'live'
                        ? 'success'
                        : c.status === 'scheduled'
                          ? 'info'
                          : c.status === 'closed'
                            ? 'neutral'
                            : 'warning'
                    }
                  >
                    {String(c.status)}
                  </Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
