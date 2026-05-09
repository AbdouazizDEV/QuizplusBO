import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Megaphone, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  useBroadcastNotification,
  useSendNotification,
} from '@application/notifications/use-notifications';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Card, CardBody, CardHeader } from '@presentation/components/ui/Card';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Button } from '@presentation/components/ui/Button';
import { cn } from '@shared/lib/cn';
import { toastApiError } from '@shared/lib/api-error-toast';

const sendSchema = z.object({
  user_id: z.string().uuid('UUID invalide'),
  type: z.string().trim().min(1, 'Type requis'),
  title: z.string().trim().min(1, 'Titre requis').max(120),
  body: z.string().trim().min(1, 'Message requis').max(500),
  data_json: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'JSON invalide' },
    ),
});
type SendValues = z.infer<typeof sendSchema>;

const broadcastSchema = z.object({
  type: z.string().trim().min(1, 'Type requis'),
  title: z.string().trim().min(1, 'Titre requis').max(120),
  body: z.string().trim().min(1, 'Message requis').max(500),
  data_json: sendSchema.shape.data_json,
});
type BroadcastValues = z.infer<typeof broadcastSchema>;

const TYPE_DEFAULT = 'admin_notice';

export default function NotificationsPage() {
  const [params] = useSearchParams();
  const presetUser = params.get('user_id') ?? '';
  const [tab, setTab] = useState<'send' | 'broadcast'>(presetUser ? 'send' : 'broadcast');
  const sendM = useSendNotification();
  const broadM = useBroadcastNotification();

  const sendForm = useForm<SendValues>({
    resolver: zodResolver(sendSchema),
    defaultValues: { user_id: presetUser, type: TYPE_DEFAULT, title: '', body: '', data_json: '' },
  });
  const broadForm = useForm<BroadcastValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { type: TYPE_DEFAULT, title: '', body: '', data_json: '' },
  });

  useEffect(() => {
    if (presetUser) sendForm.setValue('user_id', presetUser);
  }, [presetUser, sendForm]);

  const onSend = sendForm.handleSubmit(async (values) => {
    try {
      const data = values.data_json ? (JSON.parse(values.data_json) as Record<string, unknown>) : {};
      await sendM.mutateAsync({
        user_id: values.user_id,
        type: values.type,
        title: values.title,
        body: values.body,
        data,
      });
      toast.success('Notification envoyée');
      sendForm.reset({ user_id: '', type: TYPE_DEFAULT, title: '', body: '', data_json: '' });
    } catch (err) {
      toastApiError(err);
    }
  });

  const onBroadcast = broadForm.handleSubmit(async (values) => {
    try {
      const data = values.data_json ? (JSON.parse(values.data_json) as Record<string, unknown>) : {};
      const res = await broadM.mutateAsync({
        type: values.type,
        title: values.title,
        body: values.body,
        data,
      });
      toast.success(`Diffusion : ${res.inserted} destinataires`);
      broadForm.reset({ type: TYPE_DEFAULT, title: '', body: '', data_json: '' });
    } catch (err) {
      toastApiError(err);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Audience"
        title="Notifications"
        description="Envoyez une notification ciblée ou diffusez à tous les utilisateurs."
      />

      <div className="inline-flex rounded-xl border border-border bg-surface p-1 shadow-soft">
        <TabButton active={tab === 'broadcast'} onClick={() => setTab('broadcast')} icon={<Megaphone className="h-4 w-4" />}>
          Broadcast
        </TabButton>
        <TabButton active={tab === 'send'} onClick={() => setTab('send')} icon={<User className="h-4 w-4" />}>
          Notification ciblée
        </TabButton>
      </div>

      {tab === 'send' ? (
        <Card>
          <CardHeader
            title="Envoyer à un utilisateur"
            description="Saisissez l'UUID du profil destinataire."
          />
          <CardBody>
            <form onSubmit={onSend} className="grid gap-4 sm:grid-cols-2">
              <Input
                {...sendForm.register('user_id')}
                label="UUID utilisateur"
                placeholder="uuid…"
                error={sendForm.formState.errors.user_id?.message}
              />
              <Input
                {...sendForm.register('type')}
                label="Type"
                placeholder="admin_notice"
                error={sendForm.formState.errors.type?.message}
              />
              <div className="sm:col-span-2">
                <Input
                  {...sendForm.register('title')}
                  label="Titre"
                  placeholder="Ex. Nouveau quiz disponible"
                  error={sendForm.formState.errors.title?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  {...sendForm.register('body')}
                  label="Message"
                  rows={4}
                  placeholder="Découvrez le nouveau quiz Histoire…"
                  error={sendForm.formState.errors.body?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  {...sendForm.register('data_json')}
                  label="Données additionnelles (JSON, optionnel)"
                  rows={3}
                  placeholder='{"deeplink": "/quiz/123"}'
                  error={sendForm.formState.errors.data_json?.message}
                  hint="Doit être un JSON valide."
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="gradient" leftIcon={<Send className="h-4 w-4" />} loading={sendM.isPending}>
                  Envoyer
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Diffusion à tous"
            description="Notification visible par toute la base utilisateurs."
          />
          <CardBody>
            <form onSubmit={onBroadcast} className="grid gap-4 sm:grid-cols-2">
              <Input
                {...broadForm.register('type')}
                label="Type"
                placeholder="admin_notice"
                error={broadForm.formState.errors.type?.message}
              />
              <Input
                {...broadForm.register('title')}
                label="Titre"
                placeholder="Annonce globale"
                error={broadForm.formState.errors.title?.message}
              />
              <div className="sm:col-span-2">
                <Textarea
                  {...broadForm.register('body')}
                  label="Message"
                  rows={4}
                  placeholder="Bonjour à tous, …"
                  error={broadForm.formState.errors.body?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  {...broadForm.register('data_json')}
                  label="Données additionnelles (JSON, optionnel)"
                  rows={3}
                  placeholder='{"campaign":"may-2026"}'
                  error={broadForm.formState.errors.data_json?.message}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="gradient" leftIcon={<Megaphone className="h-4 w-4" />} loading={broadM.isPending}>
                  Diffuser
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors',
        active ? 'quizz-gradient text-white shadow-glow' : 'text-muted hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
