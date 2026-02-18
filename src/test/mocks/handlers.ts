import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const handlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@test.com',
          role: 'user',
          is_active: true,
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      });
    }

    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        user: {
          id: '2',
          username: 'admin',
          email: 'admin@test.com',
          role: 'admin',
          is_active: true,
        },
        access_token: 'mock-admin-token',
        refresh_token: 'mock-admin-refresh',
      });
    }

    return HttpResponse.json(
      { error: 'Неверные данные для входа' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.username === 'existinguser') {
      return HttpResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      user: {
        id: '3',
        username: body.username,
        email: body.email,
        role: 'user',
        is_active: true,
      },
      access_token: 'mock-new-user-token',
      refresh_token: 'mock-new-user-refresh',
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'mock-refreshed-token',
      refresh_token: 'mock-refreshed-refresh-token',
    });
  }),

  http.get(`${API_BASE_URL}/profile`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      role: 'user',
      is_active: true,
    });
  }),

  http.put(`${API_BASE_URL}/profile`, async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      id: '1',
      username: body.username || 'testuser',
      email: body.email || 'test@test.com',
      role: 'user',
      is_active: true,
    });
  }),

  http.delete(`${API_BASE_URL}/account`, () => {
    return HttpResponse.json({ message: 'Account deleted' });
  }),

  http.post(`${API_BASE_URL}/content/analyze`, async ({ request }) => {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    
    return HttpResponse.json({
      id: 'analysis-1',
      text: text,
      is_scam: text.toLowerCase().includes('scam'),
      confidence: 0.85,
      categories: ['phishing'],
      created_at: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE_URL}/content/history`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      items: [
        {
          id: '1',
          text: 'Test content',
          is_scam: false,
          confidence: 0.9,
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
      page,
      limit,
      pages: 1,
    });
  }),

  http.get(`${API_BASE_URL}/admin/users`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      items: [
        {
          id: '1',
          username: 'user1',
          email: 'user1@test.com',
          role: 'user',
          is_active: true,
        },
        {
          id: '2',
          username: 'user2',
          email: 'user2@test.com',
          role: 'user',
          is_active: true,
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
      pages: 1,
    });
  }),

  http.patch(`${API_BASE_URL}/admin/users/:userId/role`, async ({ params, request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      id: params.userId,
      username: 'user1',
      email: 'user1@test.com',
      role: body.role,
      is_active: true,
    });
  }),

  http.patch(`${API_BASE_URL}/admin/users/:userId/block`, ({ params }) => {
    return HttpResponse.json({
      id: params.userId,
      username: 'user1',
      email: 'user1@test.com',
      role: 'user',
      is_active: false,
    });
  }),

  http.patch(`${API_BASE_URL}/admin/users/:userId/unblock`, ({ params }) => {
    return HttpResponse.json({
      id: params.userId,
      username: 'user1',
      email: 'user1@test.com',
      role: 'user',
      is_active: true,
    });
  }),

  http.get(`${API_BASE_URL}/files/:path`, () => {
    return HttpResponse.text('Mock file content');
  }),
];
