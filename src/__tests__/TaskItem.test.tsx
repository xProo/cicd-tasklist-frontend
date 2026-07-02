import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Description test',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

const defaultProps = {
	onToggle: vi.fn(),
	onDelete: vi.fn(),
	onEdit: vi.fn(),
};

describe('TaskItem', () => {
	it('renders task title and description', () => {
		render(<TaskItem task={mockTask} {...defaultProps} />);

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Description test')).toBeInTheDocument();
	});

	it('calls onToggle when checkbox is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();

		render(<TaskItem task={mockTask} {...defaultProps} onToggle={onToggle} />);

		await user.click(screen.getByRole('checkbox'));

		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('enters edit mode and saves changes', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();

		render(<TaskItem task={mockTask} {...defaultProps} onEdit={onEdit} />);

		await user.click(screen.getByLabelText('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Titre modifié');
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Description test',
		});
	});

	it('cancels edit mode without saving', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();

		render(<TaskItem task={mockTask} {...defaultProps} onEdit={onEdit} />);

		await user.click(screen.getByLabelText('Modifier'));
		await user.clear(screen.getByLabelText('Modifier le titre'));
		await user.type(screen.getByLabelText('Modifier le titre'), 'Ne doit pas être sauvegardé');
		await user.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(onEdit).not.toHaveBeenCalled();
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});

	it('requires confirmation before delete', async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();

		render(<TaskItem task={mockTask} {...defaultProps} onDelete={onDelete} />);

		await user.click(screen.getByLabelText('Supprimer'));
		expect(onDelete).not.toHaveBeenCalled();

		await user.click(screen.getByLabelText('Supprimer'));
		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
