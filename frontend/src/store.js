import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Action 1: Submit new complaint
export const submitComplaint = createAsyncThunk(
  'complaints/submit',
  async (formData, { dispatch }) => {
    // UPDATED TO 127.0.0.1
    const response = await axios.post('https://pharma-ai-backend-no4v.onrender.com', formData);
    dispatch(fetchComplaints());
    return response.data;
  }
);

// Action 2: Fetch all past complaints from DB
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async () => {
    // UPDATED TO 127.0.0.1
    const response = await axios.get('https://pharma-ai-backend-no4v.onrender.com');
    return response.data;
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: { 
    result: null, 
    history: [], 
    loading: false, 
    historyLoading: false, 
    error: null 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Submit Complaint Handlers
      .addCase(submitComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(submitComplaint.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to analyze complaint. Ensure backend is running.';
      })
      // Fetch History Handlers
      .addCase(fetchComplaints.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state) => {
        state.historyLoading = false;
      });
  },
});

export const store = configureStore({
  reducer: { complaints: complaintSlice.reducer }
});