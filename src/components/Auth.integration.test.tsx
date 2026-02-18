import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test/testUtils';
import userEvent from '@testing-library/user-event';
import { AuthPage } from './AuthPage';
import { authApi } from '../api/auth';

vi.mock('./common/SEO', () => ({
  SEO: () => null,
}));

vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('Auth Integration Tests', () => {
  const mockOnLogin = vi.fn();
  const mockOnBackToLanding = vi.fn();

  it('полный сценарий регистрации нового пользователя', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      username: 'newuser',
      email: 'new@test.com',
      role: 'user' as const,
      is_active: true,
    };

    vi.mocked(authApi.register).mockResolvedValue(mockUser);

    render(<AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />);

    const registerTab = screen.getByRole('tab', { name: /регистрация/i });
    await user.click(registerTab);

    const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInputs = screen.getAllByLabelText(/пароль/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/подтвердите пароль/i);
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@test.com');
    await user.type(passwordInput, 'securePass123');
    await user.type(confirmPasswordInput, 'securePass123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@test.com',
        password: 'securePass123',
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it('полный сценарий входа существующего пользователя', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '2',
      username: 'existinguser',
      email: 'existing@test.com',
      role: 'user' as const,
      is_active: true,
    };

    vi.mocked(authApi.login).mockResolvedValue(mockUser);

    render(<AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />);

    const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    await user.type(usernameInput, 'existinguser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username: 'existinguser',
        password: 'password123',
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it('сценарий валидации: попытка регистрации с существующим именем', async () => {
    const user = userEvent.setup();

    vi.mocked(authApi.register).mockRejectedValue({
      response: {
        data: { error: 'Пользователь с таким именем уже существует' },
      },
    });

    render(<AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />);

    const registerTab = screen.getByRole('tab', { name: /регистрация/i });
    await user.click(registerTab);

    const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
    const passwordInputs = screen.getAllByLabelText(/пароль/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = screen.getByLabelText(/подтвердите пароль/i);
    const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });

    await user.type(usernameInput, 'existinguser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/пользователь с таким именем уже существует/i)).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });

  it('сценарий обработки ошибок сети', async () => {
    const user = userEvent.setup();

    vi.mocked(authApi.login).mockRejectedValue({
      request: {},
    });

    render(<AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />);

    const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/не удалось подключиться к серверу/i)).toBeInTheDocument();
    });
  });
});
