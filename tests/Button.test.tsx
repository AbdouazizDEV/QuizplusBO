import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@presentation/components/ui/Button';

describe('<Button />', () => {
  it('rend le label et déclenche onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Valider</Button>);
    const btn = screen.getByRole('button', { name: /valider/i });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('désactive en loading et affiche un spinner', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        Envoyer
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });
});
