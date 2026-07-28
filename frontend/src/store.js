import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://pharma-ai-backend-no4v.onrender.com/api/v1';

// Placeholder for fetchComplaints (Ensure this exists in your store or import it)
export const fetchComplaints = createAsyncThunk(
  'complaints/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/complaints`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// Action 1: Submit new complaint
export const submitComplaint = createAsyncThunk(
  'complaints/submit',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/complaints/process`,
        formData
      );
      
      // Refresh complaints list after successful submission
      dispatch(fetchComplaints());
      
      return response.data;
    } catch (error) {
      // Return FastAPI string detail or standard error message on failure
      const errorMessage = error.response?.data?.detail || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// Complaints Slice
const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Submit Complaint Handlers
      .addCase(submitComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitComplaint.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Complaints Handlers
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Configure Store
export const store = configureStore({
  reducer: {
    complaints: complaintsSlice.reducer,
  },
});

export default store;