import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllTasks, updateTaskStatus } from '../store/slices/taskSlice';
import { RootState } from '../store';
import { ClockIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import useSocket from '../hooks/useSocket';
import { emitTaskUpdate } from '../utils/socket';

const TaskList: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { tasks, isLoading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Initialize socket for real-time updates
  useSocket();

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const handleStatusChange = (taskId: string, newStatus: string) => {
    dispatch(updateTaskStatus({ id: taskId, status: newStatus }))
      .then((result: any) => {
        if (updateTaskStatus.fulfilled.match(result)) {
          // Emit socket event for real-time updates
          emitTaskUpdate({ id: taskId, status: newStatus });
        } else if (updateTaskStatus.rejected.match(result)) {
          // Show error message
          alert(`Failed to update task status: ${result.payload || 'Please try again later'}`);
        }
      })
      .catch((error: any) => {
        console.error('Error updating task status:', error);
        alert('Failed to update task status. Please try again later.');
      });
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filter !== 'all' && task.status !== filter) {
      return false;
    }

    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder: Record<string, number> = { pending: 0, 'in-progress': 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
      case 'in-progress':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Link to="/tasks/new" className="btn-primary">
          Create New Task
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="p-4 border-b border-gray-200 bg-gray-50 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="filter" className="sr-only">Filter by status</label>
              <select
                id="filter"
                name="filter"
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortBy" className="sr-only">Sort by</label>
              <select
                id="sortBy"
                name="sortBy"
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
          <div className="mt-3 sm:mt-0">
            <label htmlFor="search" className="sr-only">Search tasks</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading tasks...</p>
          </div>
        ) : sortedTasks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <li key={task._id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <Link to={`/tasks/${task._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
                        {task.title}
                      </Link>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5.001 5.001 0 0010 11z" clipRule="evenodd" />
                          </svg>
                          {typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Loading...'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex items-center">
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </div>
                        {/* Status change dropdown for the task owner or admin */}
                        {(user?.role === 'admin' || (typeof task.createdBy === 'object' && task.createdBy._id === user?._id)) && (
                          <select
                            className="ml-2 block text-sm text-gray-500 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No tasks found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList; 