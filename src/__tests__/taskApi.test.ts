import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function mockFetch(response: Partial<Response>) {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockTask),
			text: () => Promise.resolve(''),
			...response,
		})
	);
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	describe('getTasks', () => {
		it('returns an array of tasks', async () => {
			mockFetch({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			});

			const tasks = await getTasks();

			expect(tasks).toEqual([mockTask]);
			expect(fetch).toHaveBeenCalledWith('/api/tasks');
		});

		it('throws on HTTP error', async () => {
			mockFetch({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Server error'),
			});

			await expect(getTasks()).rejects.toThrow('HTTP 500: Server error');
		});
	});

	describe('getTask', () => {
		it('returns a single task', async () => {
			mockFetch({
				ok: true,
				json: () => Promise.resolve(mockTask),
			});

			const task = await getTask(1);

			expect(task).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
		});

		it('throws on HTTP error', async () => {
			mockFetch({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			});

			await expect(getTask(999)).rejects.toThrow('HTTP 404: Not found');
		});
	});

	describe('createTask', () => {
		it('sends POST request and returns created task', async () => {
			const payload = { title: 'New task', description: 'Details' };
			mockFetch({
				ok: true,
				json: () => Promise.resolve({ ...mockTask, ...payload }),
			});

			const task = await createTask(payload);

			expect(task.title).toBe('New task');
			expect(fetch).toHaveBeenCalledWith('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		});

		it('throws on HTTP error', async () => {
			mockFetch({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad request'),
			});

			await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400: Bad request');
		});
	});

	describe('updateTask', () => {
		it('sends PUT request and returns updated task', async () => {
			const payload = { title: 'Updated', completed: true };
			mockFetch({
				ok: true,
				json: () => Promise.resolve({ ...mockTask, ...payload }),
			});

			const task = await updateTask(1, payload);

			expect(task.completed).toBe(true);
			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		});

		it('throws on HTTP error', async () => {
			mockFetch({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			});

			await expect(updateTask(999, { title: 'x' })).rejects.toThrow('HTTP 404: Not found');
		});
	});

	describe('deleteTask', () => {
		it('sends DELETE request', async () => {
			mockFetch({ ok: true });

			await deleteTask(1);

			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
		});

		it('throws on HTTP error', async () => {
			mockFetch({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			});

			await expect(deleteTask(999)).rejects.toThrow('HTTP 404: Not found');
		});
	});
});
