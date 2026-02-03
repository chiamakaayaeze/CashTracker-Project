import React, { useState, useEffect } from 'react';

const App = () => {
  // 1. Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // 2. Profile and Data State
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('cashtrack_profile')));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('cashtrack_data')) || []);
  
  // 3. UI State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('inflow');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Sync Theme to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync Data to Storage
  useEffect(() => {
    localStorage.setItem('cashtrack_data', JSON.stringify(transactions));
  }, [transactions]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const data = { name: e.target.bizName.value, category: e.target.bizType.value };
    setProfile(data);
    localStorage.setItem('cashtrack_profile', JSON.stringify(data));
  };

  const addTransaction = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      amount: Number(amount),
      note,
      type,
      date: new Date().toISOString() // Store as ISO for filtering
    };
    setTransactions([newEntry, ...transactions]);
    setAmount(''); setNote('');
  };

  // --- FEATURE: MONTHLY FILTERING ---
  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // --- FEATURE: REPORT DOWNLOADER ---
  const downloadReport = () => {
    const reportHeader = `CASHTRACK REPORT - ${selectedMonth}\nBusiness: ${profile.name}\n--------------------------\n`;
    const reportRows = filteredTransactions.map(t => 
      `${new Date(t.date).toLocaleDateString()} | ${t.type.toUpperCase()} | ${t.note || 'Cash'} | ₦${t.amount}`
    ).join('\n');
    
    const blob = new Blob([reportHeader + reportRows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${selectedMonth}.txt`;
    link.click();
  };

  if (!profile) {
    return (
      <div className="container" style={{marginTop: '50px'}}>
        <div className="card">
          <h2 style={{textAlign: 'center'}}>Setup Profile</h2>
          <form onSubmit={handleProfileSubmit}>
            <input name="bizName" placeholder="Business Name" required />
            <select name="bizType">
              <option>Retail / Online Vendor</option>
              <option>Service Provider</option>
            </select>
            <button className="btn btn-primary" style={{marginTop: '20px'}}>Get Started</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header with Theme Toggle */}
      <header className="flex-between" style={{marginBottom: '24px'}}>
        <div>
          <h1 style={{margin: 0, fontSize: '20px'}}>{profile.name}</h1>
          <p style={{margin: 0, color: 'var(--primary)', fontSize: '12px'}}>{profile.category}</p>
        </div>
        <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      {/* Month Selector */}
      <div className="card">
        <label style={{fontSize: '12px', color: 'var(--text-sub)'}}>Select Month</label>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
      </div>

      {/* Totals Section */}
      <div className="card" style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white'}}>
        <p style={{margin: 0, opacity: 0.8}}>Monthly Balance</p>
        <h1 style={{fontSize: '36px', margin: '8px 0'}}>
          ₦{filteredTransactions.reduce((acc, t) => t.type === 'inflow' ? acc + t.amount : acc - t.amount, 0).toLocaleString()}
        </h1>
        <button onClick={downloadReport} style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'}}>
          📥 Download .txt Report
        </button>
      </div>

      {/* Transaction Form */}
      <div className="card">
        <h3>Add Transaction</h3>
        <form onSubmit={addTransaction}>
          <div className="flex-between" style={{gap: '10px', marginBottom: '15px'}}>
            <button type="button" onClick={() => setType('inflow')} className="btn" style={{flex: 1, background: type === 'inflow' ? 'var(--inflow)' : 'var(--bg-color)', color: type === 'inflow' ? 'white' : 'var(--text-sub)'}}>Inflow</button>
            <button type="button" onClick={() => setType('outflow')} className="btn" style={{flex: 1, background: type === 'outflow' ? 'var(--outflow)' : 'var(--bg-color)', color: type === 'outflow' ? 'white' : 'var(--text-sub)'}}>Outflow</button>
          </div>
          <input type="number" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input type="text" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-primary" style={{marginTop: '15px'}}>Save Record</button>
        </form>
      </div>

      {/* Transaction History */}
      <h3>{new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })} History</h3>
      {filteredTransactions.map(t => (
        <div key={t.id} className="card flex-between" style={{padding: '12px 20px'}}>
          <div>
            <div style={{fontWeight: 'bold'}}>{t.note || 'Cash Entry'}</div>
            <div style={{fontSize: '11px', color: 'var(--text-sub)'}}>{new Date(t.date).toLocaleDateString()}</div>
          </div>
          <span style={{color: t.type === 'inflow' ? 'var(--inflow)' : 'var(--outflow)', fontWeight: 'bold'}}>
            {t.type === 'inflow' ? '+' : '-'} ₦{t.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default App;