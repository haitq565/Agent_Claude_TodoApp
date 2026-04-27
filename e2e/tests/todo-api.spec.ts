import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000';

function newTodoPayload(suffix = Date.now()) {
  return {
    title: `API Test Todo ${suffix}`,
    description: 'Created by Playwright API test',
    status: 'active',
    priority: 'medium',
    category: 'Work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

test.describe('Todo API — JSON Server /todos', () => {
  let createdId: number;

  // ─── READ ───────────────────────────────────────────────────────────

  test('GET /todos trả về 200 và danh sách todos', async ({ request }) => {
    const res = await request.get(`${API_BASE}/todos`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /todos — mỗi item có đủ required fields', async ({ request }) => {
    const res = await request.get(`${API_BASE}/todos`);
    const todos = await res.json();
    const requiredFields = ['id', 'title', 'status', 'priority', 'category', 'createdAt', 'updatedAt'];
    for (const todo of todos.slice(0, 5)) {
      for (const field of requiredFields) {
        expect(todo).toHaveProperty(field);
      }
    }
  });

  // ─── CREATE ─────────────────────────────────────────────────────────

  test('POST /todos tạo mới và trả về 201', async ({ request }) => {
    const payload = newTodoPayload();
    const res = await request.post(`${API_BASE}/todos`, { data: payload });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe('number');
    expect(body.title).toBe(payload.title);
    expect(body.status).toBe('active');
    expect(body.priority).toBe('medium');
    createdId = body.id;
  });

  // ─── READ ONE ───────────────────────────────────────────────────────

  test('GET /todos/:id lấy đúng todo vừa tạo', async ({ request }) => {
    // Tạo mới trước
    const payload = newTodoPayload();
    const createRes = await request.post(`${API_BASE}/todos`, { data: payload });
    const created = await createRes.json();

    const res = await request.get(`${API_BASE}/todos/${created.id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.title).toBe(payload.title);
  });

  test('GET /todos/9999 không tồn tại → 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/todos/9999`);
    expect(res.status()).toBe(404);
  });

  // ─── UPDATE (PATCH) ──────────────────────────────────────────────────

  test('PATCH /todos/:id cập nhật status thành completed', async ({ request }) => {
    const payload = newTodoPayload();
    const createRes = await request.post(`${API_BASE}/todos`, { data: payload });
    const created = await createRes.json();

    const patchRes = await request.patch(`${API_BASE}/todos/${created.id}`, {
      data: { status: 'completed', updatedAt: new Date().toISOString() },
    });
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    expect(updated.status).toBe('completed');
    expect(updated.title).toBe(payload.title); // title không đổi
  });

  // ─── UPDATE (PUT) ────────────────────────────────────────────────────

  test('PUT /todos/:id thay thế toàn bộ fields', async ({ request }) => {
    const payload = newTodoPayload();
    const createRes = await request.post(`${API_BASE}/todos`, { data: payload });
    const created = await createRes.json();

    const replacement = {
      ...payload,
      title: 'Replaced Title',
      priority: 'high',
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };
    const putRes = await request.put(`${API_BASE}/todos/${created.id}`, { data: replacement });
    expect(putRes.status()).toBe(200);
    const body = await putRes.json();
    expect(body.title).toBe('Replaced Title');
    expect(body.priority).toBe('high');
    expect(body.status).toBe('completed');
  });

  // ─── DELETE ─────────────────────────────────────────────────────────

  test('DELETE /todos/:id xóa todo, GET lại → 404', async ({ request }) => {
    const payload = newTodoPayload();
    const createRes = await request.post(`${API_BASE}/todos`, { data: payload });
    const created = await createRes.json();

    const delRes = await request.delete(`${API_BASE}/todos/${created.id}`);
    expect(delRes.status()).toBe(200);

    const getRes = await request.get(`${API_BASE}/todos/${created.id}`);
    expect(getRes.status()).toBe(404);
  });

  // ─── FILTER & SEARCH ─────────────────────────────────────────────────

  test('GET /todos?status=active — tất cả items có status=active', async ({ request }) => {
    const res = await request.get(`${API_BASE}/todos?status=active`);
    expect(res.status()).toBe(200);
    const todos = await res.json();
    expect(todos.length).toBeGreaterThan(0);
    for (const todo of todos) {
      expect(todo.status).toBe('active');
    }
  });

  test('GET /todos?priority=high — tất cả items có priority=high', async ({ request }) => {
    const res = await request.get(`${API_BASE}/todos?priority=high`);
    expect(res.status()).toBe(200);
    const todos = await res.json();
    for (const todo of todos) {
      expect(todo.priority).toBe('high');
    }
  });

  test('GET /todos?title_like=keyword — title chứa keyword', async ({ request }) => {
    const keyword = 'Todo';
    const res = await request.get(`${API_BASE}/todos?title_like=${keyword}`);
    expect(res.status()).toBe(200);
    const todos = await res.json();
    expect(todos.length).toBeGreaterThan(0);
    for (const todo of todos) {
      expect(todo.title.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });
});
