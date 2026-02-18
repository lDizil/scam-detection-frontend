import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/testUtils';
import userEvent from '@testing-library/user-event';
import { AuthPage } from './AuthPage';

vi.mock('./common/SEO', () => ({
  SEO: () => null,
}));

vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

import { authApi } from '../api/auth';

describe('AuthPage', () => {
  const mockOnLogin = vi.fn();
  const mockOnBackToLanding = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Форма входа', () => {
    it('должен рендерить форму входа по умолчанию', () => {
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      expect(screen.getByRole('textbox', { name: /имя пользователя/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('должен показывать ошибку при пустых полях', async () => {
      const user = userEvent.setup();
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const submitButton = screen.getByRole('button', { name: /войти/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/заполните все поля/i)).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('должен показывать ошибку при коротком пароле', async () => {
      const user = userEvent.setup();
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
      const passwordInput = screen.getByLabelText(/пароль/i);
      const submitButton = screen.getByRole('button', { name: /войти/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, '12345');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/пароль должен содержать минимум 6 символов/i)).toBeInTheDocument();
      });

      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('должен вызывать login API с корректными данными', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: 'user' as const,
        is_active: true,
      };

      vi.mocked(authApi.login).mockResolvedValue(mockUser);

      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
      const passwordInput = screen.getByLabelText(/пароль/i);
      const submitButton = screen.getByRole('button', { name: /войти/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });

      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });

    it('должен показывать ошибку при неудачной попытке входа', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Неверные данные для входа';
      
      vi.mocked(authApi.login).mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
      const passwordInput = screen.getByLabelText(/пароль/i);
      const submitButton = screen.getByRole('button', { name: /войти/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('должен переключать видимость пароля', async () => {
      const user = userEvent.setup();
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const passwordInput = screen.getByLabelText(/пароль/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find((btn: HTMLElement) => 
        btn.querySelector('svg') !== null && btn.getAttribute('type') === 'button'
      );

      if (toggleButton) {
        await user.click(toggleButton);
        await waitFor(() => {
          expect(passwordInput.type).toBe('text');
        });
      }
    });
  });

  describe('Форма регистрации', () => {
    it('должен рендерить форму регистрации при переключении вкладки', async () => {
      const user = userEvent.setup();
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const registerTab = screen.getByRole('tab', { name: /регистрация/i });
      await user.click(registerTab);

      expect(screen.getByRole('textbox', { name: /имя пользователя/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      const passwordInputs = screen.getAllByLabelText(/пароль/i);
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByLabelText(/подтвердите пароль/i)).toBeInTheDocument();
    });

    it('должен показывать ошибку при несовпадении паролей', async () => {
      const user = userEvent.setup();
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const registerTab = screen.getByRole('tab', { name: /регистрация/i });
      await user.click(registerTab);

      const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
      const passwordInputs = screen.getAllByLabelText(/пароль/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = screen.getByLabelText(/подтвердите пароль/i);
      const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });

      await user.type(usernameInput, 'newuser');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument();
      });

      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('должен показывать ошибку при невалидном email', async () => {
      const user = userEvent.setup();
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      const registerTab = screen.getByRole('tab', { name: /регистрация/i });
      await user.click(registerTab);

      const usernameInput = screen.getByRole('textbox', { name: /имя пользователя/i });
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInputs = screen.getAllByLabelText(/пароль/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = screen.getByLabelText(/подтвердите пароль/i);
      const submitButton = screen.getByRole('button', { name: /зарегистрироваться/i });

      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/введите корректный email адрес/i)).toBeInTheDocument();
      });

      expect(authApi.register).not.toHaveBeenCalled();
    });

    it('должен вызывать register API с корректными данными', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: '1',
        username: 'newuser',
        email: 'new@test.com',
        role: 'user' as const,
        is_active: true,
      };

      vi.mocked(authApi.register).mockResolvedValue(mockUser);

      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

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
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@test.com',
          password: 'password123',
        });
      });

      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Обработка ошибок сервера', () => {
    it('должен показывать сообщение о проблемах с подключением к серверу', async () => {
      const user = userEvent.setup();
      
      vi.mocked(authApi.login).mockRejectedValue({
        request: {},
      });

      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

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

  describe('Блокировка аккаунта', () => {
    it('должен показывать сообщение о блокировке при параметре blocked=true', () => {
      render(
        <AuthPage onLogin={mockOnLogin} onBackToLanding={mockOnBackToLanding} />
      );

      expect(screen.getByRole('textbox', { name: /имя пользователя/i })).toBeInTheDocument();
    });
  });
});
