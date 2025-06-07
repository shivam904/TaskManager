import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllTasks } from '../store/slices/taskSlice';
import { RootState } from '../store';
import { ClockIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import useSocket from '../hooks/useSocket';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  
  // Initialize socket for real-time updates
  useSocket();

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  // Calculate task statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Get tasks due soon (in the next 3 days)
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  const tasksDueSoon = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= threeDaysFromNow && task.status !== 'completed';
  });

  // Get recent tasks (created in the last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const recentTasks = tasks.filter(task => {
    const createdAt = new Date(task.createdAt);
    return createdAt >= sevenDaysAgo;
  }); // Get all recent tasks instead of limiting to 5

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/tasks/new" className="btn-primary">
          Create New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{totalTasks}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{pendingTasks}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{inProgressTasks}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{completedTasks}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Tasks Due Soon */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Tasks Due Soon</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Tasks due in the next 3 days</p>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : tasksDueSoon.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {tasksDueSoon.map((task) => (
                    <li key={task._id} className="px-4 py-4 sm:px-6">
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
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No tasks due soon</div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Tasks</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Tasks created in the last 7 days</p>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : recentTasks.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {recentTasks.map((task) => (
                    <li key={task._id} className="px-4 py-4 sm:px-6">
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
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No recent tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 