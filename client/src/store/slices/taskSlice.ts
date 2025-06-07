import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi } from '../../api/taskApi';
import { Task, TaskState } from '../../types';

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskApi.getAllTasks();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch tasks');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskById(id);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch task');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData: FormData, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to create task');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, taskData }: { id: string; taskData: FormData }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTask(id, taskData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to update task');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskApi.deleteTask(id);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to delete task');
      }
      return { id, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTaskStatus(id, status);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to update task status');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task status');
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, text }: { taskId: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await taskApi.addComment(taskId, text);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to add comment');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks cases
      .addCase(fetchAllTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch task by ID cases
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.currentTask = action.payload.data;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create task cases
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.tasks.push(action.payload.data);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update task cases
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const updatedTask = action.payload.data;
        state.tasks = state.tasks.map((task) => 
          task._id === updatedTask._id ? updatedTask : task
        );
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete task cases
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload.id);
        if (state.currentTask && state.currentTask._id === action.payload.id) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update task status cases
      .addCase(updateTaskStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const updatedTask = action.payload.data;
        state.tasks = state.tasks.map((task) => 
          task._id === updatedTask._id ? updatedTask : task
        );
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add comment cases
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const updatedTask = action.payload.data;
        state.tasks = state.tasks.map((task) => 
          task._id === updatedTask._id ? updatedTask : task
        );
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTaskError, setCurrentTask, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer; 