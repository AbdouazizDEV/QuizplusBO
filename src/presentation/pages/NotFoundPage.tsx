import { Link } from 'react-router-dom';
import { Button } from '@presentation/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="quizz-gradient-text text-7xl font-black">404</span>
      <h2 className="text-xl font-bold">Page introuvable</h2>
      <p className="max-w-sm text-sm text-muted">
        L'URL demandée n'existe pas dans ce backoffice ou a été déplacée.
      </p>
      <Link to="/">
        <Button variant="primary">Revenir au dashboard</Button>
      </Link>
    </div>
  );
}
