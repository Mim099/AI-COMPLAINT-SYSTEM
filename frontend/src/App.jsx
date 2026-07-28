import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitComplaint, fetchComplaints } from './store';

function App() {
  const dispatch = useDispatch();
  const { result, history, loading, historyLoading, error } = useSelector((state) => state.complaints);

  const [form, setForm] = useState({
    product_name: '',
    batch_number: '',
    description: ''
  });

  // Fetch past complaints when component mounts
  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitComplaint(form));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <h1 style={{ color: '#111827', margin: 0, fontSize: '24px', fontWeight: '700' }}>Pharma AI Complaint Management Portal</h1>
        <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Automated Triage & 5-Whys Root Cause Analysis powered by LangGraph & Groq</p>
      </header>

      {/* Top Section: Intake Form + AI Result Output */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        {/* Form Panel */}
        <form onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginBottom: '16px' }}>Log New Product Defect</h2>
          
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Product Name</label>
          <input
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '16px', boxSizing: 'border-box' }}
            required
            placeholder="e.g., Amoxicillin 500mg Oral Suspension"
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          />

          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Batch / Lot Number</label>
          <input
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '16px', boxSizing: 'border-box' }}
            required
            placeholder="e.g., BATCH-2026-X99"
            value={form.batch_number}
            onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
          />

          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Complaint Description</label>
          <textarea
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '16px', boxSizing: 'border-box' }}
            rows="4"
            required
            placeholder="Describe defect, discoloration, seal failure, or particles observed..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'AI Pipeline Executing...' : 'Run AI Investigation'}
          </button>
          {error && <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '12px' }}>{error}</p>}
        </form>

        {/* Output Panel */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginBottom: '16px' }}>AI Investigation Report</h2>
          
          {!result && !loading && (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Fill out the defect form on the left to trigger the LangGraph orchestration engine.</p>
          )}

          {loading && <p style={{ color: '#2563eb', fontSize: '14px', fontWeight: '500' }}>⚡ Processing with gemma2-9b-it & llama-3.3-70b-versatile...</p>}

          {result && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Complaint ID</span>
                <p style={{ margin: '2px 0 0', fontWeight: '600', color: '#111827' }}>{result.complaint_number}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Risk Level</span>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginTop: '4px',
                    backgroundColor: result.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                    color: result.severity === 'Critical' ? '#991b1b' : '#92400e'
                  }}>
                    {result.severity}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Summary</span>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#374151' }}>{result.summary}</p>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Root Cause Analysis (5 Whys)</span>
                <pre style={{
                  background: '#f9fafb',
                  border: '1px solid #f3f4f6',
                  padding: '12px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '12px',
                  color: '#1f2937',
                  marginTop: '6px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {result.root_cause}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Complaint History Dashboard Table */}
      <section style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginTop: 0, marginBottom: '16px', color: '#111827' }}>Logged Complaints History</h2>
        
        {historyLoading && <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading database records...</p>}
        
        {!historyLoading && history.length === 0 && (
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>No complaints stored in database yet.</p>
        )}

        {!historyLoading && history.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#4b5563' }}>
                  <th style={{ padding: '10px' }}>Complaint ID</th>
                  <th style={{ padding: '10px' }}>Product</th>
                  <th style={{ padding: '10px' }}>Batch</th>
                  <th style={{ padding: '10px' }}>Severity</th>
                  <th style={{ padding: '10px' }}>AI Summary</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '600', color: '#2563eb' }}>{item.complaint_number}</td>
                    <td style={{ padding: '12px 10px', color: '#111827' }}>{item.product_name}</td>
                    <td style={{ padding: '12px 10px', color: '#4b5563' }}>{item.batch_number}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: item.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                        color: item.severity === 'Critical' ? '#991b1b' : '#92400e'
                      }}>
                        {item.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#4b5563', maxWidth: '300px' }}>{item.ai_summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;