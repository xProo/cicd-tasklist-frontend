import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create mode by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);

		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
	});

	it('renders edit mode when specified', () => {
		render(
			<TaskForm
				mode="edit"
				initialValues={{ title: 'Tâche existante', description: 'Desc' }}
				onSubmit={vi.fn()}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
		expect(screen.getByDisplayValue('Tâche existante')).toBeInTheDocument();
	});

	it('submits valid form data', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText('Titre'), 'Ma nouvelle tâche');
		await user.type(screen.getByLabelText('Description'), 'Une description');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma nouvelle tâche',
			description: 'Une description',
		});
	});

	it('shows validation error when title is empty', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(<TaskForm onSubmit={onSubmit} />);

		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('clears fields after successful create', async () => {
		const user = userEvent.setup();

		render(<TaskForm onSubmit={vi.fn()} />);

		const titleInput = screen.getByLabelText('Titre');
		await user.type(titleInput, 'Tâche temporaire');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(titleInput).toHaveValue('');
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();

		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(onCancel).toHaveBeenCalled();
	});
});
