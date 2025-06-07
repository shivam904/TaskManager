import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTask, clearTaskError } from '../store/slices/taskSlice';
import { fetchAllUsers } from '../store/slices/userSlice';
import { RootState } from '../store';
import { ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import useSocket from '../hooks/useSocket';
import { emitTaskUpdate } from '../utils/socket';

// Define the schema for task form validation
const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Due date is required and must be a valid date',
  }),
  assignedTo: z.string().min(1, 'Please select a user'),
});

type TaskFormData = z.infer<typeof taskSchema>;

const CreateTask: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  const { isLoading, error } = useSelector((state: RootState) => state.tasks);
  const { users } = useSelector((state: RootState) => state.users);
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'pending',
      priority: 'medium',
    },
  });

  useEffect(() => {
    // Fetch users for the assignee dropdown
    dispatch(fetchAllUsers({}));
    
    // Clear any previous errors
    return () => {
      dispatch(clearTaskError());
    };
  }, [dispatch]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData object for file uploads
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('status', data.status);
      formData.append('priority', data.priority);
      formData.append('dueDate', data.dueDate);
      formData.append('assignedTo', data.assignedTo);
      
      // Add files if any
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('documents', files[i]);
        }
      }
      
      const resultAction = await dispatch(createTask(formData));
      
      if (createTask.fulfilled.match(resultAction)) {
        // Emit socket event for real-time updates
        emitTaskUpdate({ action: 'create', task: resultAction.payload.data });
        navigate('/tasks');
      }
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details to create a new task.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Title */}
            <div className="sm:col-span-6">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="error-message">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="error-message">{errors.description.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="sm:col-span-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className={`input-field ${errors.status ? 'border-red-500' : ''}`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && (
                <p className="error-message">{errors.status.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="sm:col-span-3">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                {...register('priority')}
                className={`input-field ${errors.priority ? 'border-red-500' : ''}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="error-message">{errors.priority.message}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="sm:col-span-3">
              <label htmlFor="dueDate" className="form-label">
                Due Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="date"
                  id="dueDate"
                  {...register('dueDate')}
                  className={`input-field pl-10 ${errors.dueDate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.dueDate && (
                <p className="error-message">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Assigned To */}
            <div className="sm:col-span-3">
              <label htmlFor="assignedTo" className="form-label">
                Assigned To
              </label>
              <select
                id="assignedTo"
                {...register('assignedTo')}
                className={`input-field ${errors.assignedTo ? 'border-red-500' : ''}`}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="error-message">{errors.assignedTo.message}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="sm:col-span-6">
              <label htmlFor="documents" className="form-label">
                Documents (Max 5 files)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="documents"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="documents"
                        name="documents"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => setFiles(e.target.files)}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 20MB</p>
                </div>
              </div>
              {files && files.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                  <ul className="mt-1 text-sm text-gray-500">
                    {Array.from(files).map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask; 