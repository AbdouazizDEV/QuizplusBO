import { useEffect, useRef, useState } from 'react';
import { Copy, ImageUp, Upload, Check, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadImage } from '@application/media/use-media';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Card, CardBody, CardHeader } from '@presentation/components/ui/Card';
import { Input } from '@presentation/components/ui/Input';
import { Button } from '@presentation/components/ui/Button';
import { cn } from '@shared/lib/cn';
import { toastApiError } from '@shared/lib/api-error-toast';

const MAX_BYTES = 5 * 1024 * 1024;

export default function MediaPage() {
  const upload = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState('backoffice-admin');
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith('image/')) {
      toast.error('Veuillez choisir un fichier image (PNG, JPG, WEBP).');
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error('Image trop volumineuse (5 Mo max).');
      return;
    }
    setFile(f);
    setSecureUrl(null);
  };

  const onUpload = async () => {
    if (!file) {
      toast.error('Veuillez choisir une image.');
      return;
    }
    if (!ownerId.trim()) {
      toast.error('Owner ID requis.');
      return;
    }
    try {
      const res = await upload.mutateAsync({ file, ownerId: ownerId.trim() });
      setSecureUrl(res.secure_url);
      toast.success('Image uploadée');
    } catch (err) {
      toastApiError(err);
    }
  };

  const onCopy = async () => {
    if (!secureUrl) return;
    try {
      await navigator.clipboard.writeText(secureUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Outils"
        title="Upload média"
        description="Hébergez vos covers de quiz sur Cloudinary via le backend."
      />

      <Card>
        <CardHeader title="Charger une image" description="PNG, JPG, WEBP — 5 Mo max." />
        <CardBody className="grid gap-6 lg:grid-cols-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className={cn(
              'flex h-72 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors',
              'hover:border-brand-500/60 hover:bg-brand-50/40 dark:hover:bg-brand-500/5',
            )}
          >
            {preview ? (
              <img src={preview} alt="aperçu" className="max-h-full max-w-full rounded-lg object-contain" />
            ) : (
              <>
                <span className="quizz-gradient inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-glow">
                  <Upload className="h-5 w-5" />
                </span>
                <p className="text-sm font-bold">Glissez-déposez ou cliquez</p>
                <p className="text-xs text-muted">PNG, JPG, WEBP — 5 Mo max</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Owner ID"
              hint="Préfixe utilisé pour nommer le fichier côté Cloudinary."
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            />

            {file && (
              <div className="rounded-xl border border-border bg-surfaceMuted/50 p-3">
                <div className="flex items-center gap-3">
                  <ImageUp className="h-4 w-4 text-muted" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{file.name}</p>
                    <p className="text-2xs text-muted">{(file.size / 1024).toFixed(1)} Ko</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Retirer"
                    className="ml-auto rounded-lg p-1.5 text-muted hover:bg-surface hover:text-danger"
                    onClick={() => {
                      setFile(null);
                      setSecureUrl(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="gradient"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={onUpload}
                loading={upload.isPending}
                disabled={!file}
              >
                Uploader
              </Button>
            </div>

            {secureUrl && (
              <div className="rounded-xl border border-success/30 bg-success/5 p-3">
                <p className="text-2xs font-bold uppercase tracking-widest text-success">URL sécurisée</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-surface px-2 py-1 text-xs">
                    {secureUrl}
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    onClick={onCopy}
                  >
                    {copied ? 'Copié' : 'Copier'}
                  </Button>
                  <a href={secureUrl} target="_blank" rel="noreferrer">
                    <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Ouvrir
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
