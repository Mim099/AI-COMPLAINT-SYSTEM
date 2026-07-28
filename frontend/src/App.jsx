import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitComplaint, fetchComplaints } from './store'; // Adjust path to './redux/store' if store.js is inside src/redux/

// 1. Separate Child Component for Form Submission
function ComplaintForm() {
  const [productName, setProductName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [description, setDescription] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.complaints || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !batchNumber.trim()) return;

    dispatch(
      submitComplaint({
        product_name: productName,
        batch_number: batchNumber,
        description: description,
      })
    );

    // Reset input fields
    setProductName('');
    setBatchNumber('');
    setDescription('');
  };

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Ingest Pharma Complaint</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
            Product Name
          </label>
          <input
            type="text"
            placeholder="e.g., Amoxicillin 500mg"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'Inter, sans-serif' }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
            Batch Number
          </label>
          <input
            type="text"
            placeholder="e.g., B2026-AMX-09"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'Inter, sans-serif' }}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
            Complaint Details
          </label>
          <textarea
            rows={4}
            placeholder="Describe product defect, packaging damage, or adverse event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'Inter, sans-serif' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#94a3b8' : '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing via LangGraph...' : 'Analyze & Classify Complaint'}
        </button>

        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px' }}>{error}</p>}
      </form>
    </div>
  );
}

// 2. Separate Child Component for Results Display
function AnalysisDisplay() {
  const { activeAnalysis } = useSelector((state) => state.complaints || {});

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>AI Triage & RCA Output</h2>
      {!activeAnalysis ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>
          Submit a complaint to trigger Gemma-2 & Llama-3.3 LangGraph multi-agent analysis.
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeAnalysis.severity === 'Critical' ? '#fee2e2' : '#fef3c7',
                color: activeAnalysis.severity === 'Critical' ? '#dc2626' : '#d97706',
              }}
            >
              {activeAnalysis.severity || 'Unassigned'} Severity
            </span>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
              Category: {activeAnalysis.defect_category || 'General'}
            </span>
          </div>

          {activeAnalysis.requires_field_alert && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', marginBottom: '16px', color: '#991b1b', fontSize: '13px' }}>
              <strong>⚠️ Regulatory Alert Triggered:</strong> Immediate QA Notification & FDA 15-Day Alert Assessment Required.
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Root Cause Analysis (RCA Hypothesis)</h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {activeAnalysis.root_cause_hypothesis || 'Analysis pending...'}
            </p>
          </div>

          {activeAnalysis.capa_recommendations && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Recommended CAPA Actions</h3>
              <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px' }}>
                {activeAnalysis.capa_recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 3. Main App Container
export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof fetchComplaints === 'function') {
      dispatch(fetchComplaints());
    }
  }, [dispatch]);

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
          Pharma Complaint Management System
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Automated GXP Complaint Triage & CAPA Generation (Groq / LangGraph)
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ComplaintForm />
        <AnalysisDisplay />
      </div>
    </div>
  );
}