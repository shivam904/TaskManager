import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchTaskById, deleteTask, updateTaskStatus, addComment } from '../store/slices/taskSlice';
import { RootState } from '../store';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import useSocket from '../hooks/useSocket';
import { emitTaskUpdate } from '../utils/socket';
import { taskApi } from '../api/taskApi';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  const { currentTask, isLoading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [commentText, setCommentText] = useState('');
  
  // Initialize socket for real-time updates
  useSocket();

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = (newStatus: string) => {
    if (id) {
      dispatch(updateTaskStatus({ id, status: newStatus }))
        .then((result: any) => {
          if (updateTaskStatus.fulfilled.match(result)) {
            // Emit socket event for real-time updates
            emitTaskUpdate({ id, status: newStatus });
          } else if (updateTaskStatus.rejected.match(result)) {
            // Show error message
            alert(`Failed to update task status: ${result.payload || 'Please try again later'}`);
          }
        })
        .catch((error: any) => {
          console.error('Error updating task status:', error);
          alert('Failed to update task status. Please try again later.');
        });
    }
  };

  const handleDeleteTask = async () => {
    if (id && window.confirm('Are you sure you want to delete this task?')) {
      const resultAction = await dispatch(deleteTask(id));
      if (deleteTask.fulfilled.match(resultAction)) {
        navigate('/tasks');
      }
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        if (!id) return;
        
        const response = await taskApi.deleteDocument(id, docId);
        if (response.success) {
          // Refresh task data
          dispatch(fetchTaskById(id));
        } else {
          alert('Failed to delete document: ' + response.message);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !id) return;
    
    try {
      await dispatch(addComment({ taskId: id, text: commentText }));
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if current user is the creator or admin
  const canEdit = user && currentTask && (
    user.role === 'admin' || 
    (typeof currentTask.createdBy === 'object' && currentTask.createdBy._id === user._id)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!currentTask) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Task not found</p>
        <Link to="/tasks" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
        <div className="flex space-x-2">
          <Link to="/tasks" className="btn-secondary">
            Back to Tasks
          </Link>
          {canEdit && (
            <>
              <Link to={`/tasks/edit/${id}`} className="btn-primary flex items-center">
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
              <button 
                onClick={handleDeleteTask} 
                className="btn-secondary bg-red-600 text-white hover:bg-red-700 flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Task header with status and priority */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <div className="flex items-center">
              {getStatusIcon(currentTask.status)}
              <h3 className="ml-2 text-lg leading-6 font-medium text-gray-900">
                Status: {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1)}
              </h3>
            </div>
            {canEdit && (
              <div className="mt-2">
                <label htmlFor="status-change" className="block text-sm font-medium text-gray-700">
                  Change Status:
                </label>
                <select
                  id="status-change"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={currentTask.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              currentTask.priority === 'high' ? 'bg-red-100 text-red-800' :
              currentTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1)} Priority
            </span>
          </div>
        </div>
        
        {/* Task details */}
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {currentTask.description}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {typeof currentTask.assignedTo === 'object' ? currentTask.assignedTo.name : 'Loading...'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {typeof currentTask.createdBy === 'object' ? currentTask.createdBy.name : 'Loading...'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(currentTask.dueDate)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(currentTask.createdAt)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(currentTask.updatedAt)}
              </dd>
            </div>
            
            {/* Documents section */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Documents</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {currentTask.documents && currentTask.documents.length > 0 ? (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {currentTask.documents.map((document, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <DocumentTextIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                          <span className="ml-2 flex-1 w-0 truncate">{document.originalName}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                          <a 
                            href={`http://localhost:5000/uploads/${document.filename}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Download
                          </a>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(document._id)}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No documents attached</p>
                )}
              </dd>
            </div>

            {/* Comments section */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Comments</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="space-y-4">
                  {currentTask.comments && currentTask.comments.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto space-y-4">
                      {currentTask.comments.map((comment, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {typeof comment.user === 'object' ? comment.user.name : 'User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                            <p className="mt-1 text-sm text-gray-900">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No comments yet</p>
                  )}
                  
                  {/* Add comment form */}
                  {(user?.role === 'admin' || 
                    (typeof currentTask.createdBy === 'object' && currentTask.createdBy._id === user?._id) || 
                    (typeof currentTask.assignedTo === 'object' && currentTask.assignedTo._id === user?._id)) && (
                    <form onSubmit={handleAddComment} className="mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <textarea
                              rows={2}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Add a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className={`p-1 rounded-full ${
                                  commentText.trim() ? 'text-blue-500 hover:bg-blue-100' : 'text-gray-300'
                                }`}
                              >
                                <PaperAirplaneIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 