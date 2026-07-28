import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://pharma-ai-backend-no4v.onrender.com/api/v1';


export const submitComplaint = createAsyncThunk(
  'complaints/submitComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/complaints/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData),
      });

      const data = await response.json();

      if (!response.ok) {
       
        return rejectWithValue(data.detail || 'Failed to submit complaint');
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);


export const fetchComplaints = createAsyncThunk(
  'complaints/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/complaints`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


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
      
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
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
      });
  },
});

export const store = configureStore({
  reducer: {
    complaints: complaintsSlice.reducer,
  },
});

export default store;