import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import TaskList from '../pages/TaskList';
import taskSlice from '../store/slices/taskSlice';
import authSlice from '../store/slices/authSlice';

// Mock socket hook
jest.mock('../hooks/useSocket', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock socket utils
jest.mock('../utils/socket', () => ({
  emitTaskUpdate: jest.fn(),
}));

// Mock data
const mockTasks = [
  {
    _id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-12-31',
    assignedTo: { _id: 'user1', name: 'User 1' },
    createdBy: { _id: 'user1', name: 'User 1' },
  },
  {
    _id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2024-12-25',
    assignedTo: { _id: 'user1', name: 'User 1' },
    createdBy: { _id: 'user1', name: 'User 1' },
  },
  {
    _id: '3',
    title: 'Task 3',
    description: 'Description 3',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-12-20',
    assignedTo: { _id: 'user1', name: 'User 1' },
    createdBy: { _id: 'user1', name: 'User 1' },
  },
];

const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      tasks: taskSlice,
      auth: authSlice,
    },
    preloadedState: {
      tasks: {
        tasks: [],
        currentTask: null,
        isLoading: false,
        error: null,
        ...initialState.tasks,
      },
      auth: {
        user: { _id: 'user1', name: 'Test User', email: 'test@example.com' },
        token: 'test-token',
        isLoading: false,
        error: null,
        isAuthenticated: true,
        ...initialState.auth,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState: any = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('TaskList Component', () => {
  it('renders task list correctly', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: [], isLoading: true },
    });

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const errorMessage = 'Failed to fetch tasks';
    renderWithProviders(<TaskList />, {
      tasks: { tasks: [], error: errorMessage },
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('filters tasks by status', async () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    const filterSelect = screen.getByLabelText(/filter by status/i);
    
    // Filter by pending
    await userEvent.selectOptions(filterSelect, 'pending');
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();

    // Filter by completed
    await userEvent.selectOptions(filterSelect, 'completed');
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('sorts tasks by priority', async () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    const sortSelect = screen.getByLabelText(/sort by/i);
    await userEvent.selectOptions(sortSelect, 'priority');

    const taskElements = screen.getAllByText(/Task \d/);
    expect(taskElements[0]).toHaveTextContent('Task 1'); // high priority
    expect(taskElements[1]).toHaveTextContent('Task 2'); // medium priority
    expect(taskElements[2]).toHaveTextContent('Task 3'); // low priority
  });

  it('searches tasks by title', async () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    await userEvent.type(searchInput, 'Task 1');

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
  });

  it('displays empty state when no tasks match filter', async () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    await userEvent.type(searchInput, 'Nonexistent Task');

    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
  });

  it('displays task priority badges correctly', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('displays task due dates correctly', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    expect(screen.getByText('Due: 12/31/2024')).toBeInTheDocument();
    expect(screen.getByText('Due: 12/25/2024')).toBeInTheDocument();
    expect(screen.getByText('Due: 12/20/2024')).toBeInTheDocument();
  });

  it('has accessible form controls', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search tasks/i)).toBeInTheDocument();
  });

  it('navigates to create task page', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    const createButton = screen.getByText('Create New Task');
    expect(createButton.closest('a')).toHaveAttribute('href', '/tasks/new');
  });

  it('navigates to task detail page when task title is clicked', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    const taskLink = screen.getByText('Task 1').closest('a');
    expect(taskLink).toHaveAttribute('href', '/tasks/1');
  });

  it('displays correct status icons', () => {
    renderWithProviders(<TaskList />, {
      tasks: { tasks: mockTasks },
    });

    // Check that status icons are present (they have aria-hidden="true")
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });
}); 