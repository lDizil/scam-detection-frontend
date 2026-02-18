import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '../api/auth';
import { vi } from 'vitest';

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';

export { screen, waitFor } from '@testing-library/dom';

export const mockUsers = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@test.com',
    role: 'admin' as const,
    is_active: true,
  } as User,
  moderator: {
    id: '2',
    username: 'moderator',
    email: 'moderator@test.com',
    role: 'moderator' as const,
    is_active: true,
  } as User,
  user: {
    id: '3',
    username: 'user',
    email: 'user@test.com',
    role: 'user' as const,
    is_active: true,
  } as User,
  blockedUser: {
    id: '4',
    username: 'blocked',
    email: 'blocked@test.com',
    role: 'user' as const,
    is_active: false,
  } as User,
};

export const createMockFn = () => vi.fn();

export const waitForUpdate = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
