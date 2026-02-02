import React, { useState, useEffect } from 'react';

const App = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cashtrack_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('cashtrack_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('inflow');

  useEffect(() => {
    localStorage.setItem('cashtrack_data', JSON.stringify(transactions));
  }, [transactions]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const name = e.target.bizName.value;
    const category = e.target.bizType.value;
    const newProfile = { name, category };
    setProfile(newProfile);
    localStorage.setItem('cashtrack_profile', JSON.stringify(newProfile));
  };

  const addTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    const newEntry = { id: Date.now(), amount, note, type, date: new Date().toLocaleDateString() };
    setTransactions([newEntry, ...transactions]);
    setAmount('');
    setNote('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  if (!profile) {
    return (
      <div className="container" style={{marginTop: '80px'}}>
        <div className="card">
          <h2 style={{textAlign: 'center'}}>Setup Cashtrack</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="input-group">
              <label>Business Name</label>
              <input name="bizName" placeholder="e.g. My Shop" required />
            </div>
            <div className="input-group">
              <label>Business Type</label>
              <select name="bizType">
                <option>Retail / Online Vendor</option>
                <option>Service Provider</option>
                <option>Other</option>
              </select>
            </div>
            <button className="btn btn-primary">Create Profile</button>
          </form>
        </div>
      </div>
    );
  }

  const balance = transactions.reduce((acc, t) => 
    t.type === 'inflow' ? acc + Number(t.amount) : acc - Number(t.amount), 0
  );

  return (
    <div className="container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div>
          <h2 style={{margin: 0}}>{profile.name}</h2>
          <small style={{color: '#2563eb'}}>{profile.category}</small>
        </div>
        <button onClick={() => {localStorage.clear(); window.location.reload();}} style={{fontSize: '10px', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer'}}>Reset</button>
      </header>

      <div className="card" style={{background: '#2563eb', color: 'white', textAlign: 'center'}}>
        <p style={{margin: 0, opacity: 0.8}}>Total Balance</p>
        <h1 style={{margin: '10px 0'}}>₦{balance.toLocaleString()}</h1>
      </div>

      <div className="card">
        <h3>Record Transaction</h3>
        <form onSubmit={addTransaction}>
          <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
            <button type="button" onClick={() => setType('inflow')} className="btn" style={{background: type === 'inflow' ? '#dcfce7' : '#f3f4f6', color: '#16a34a', border: type === 'inflow' ? '1px solid #16a34a' : 'none'}}>+ Inflow</button>
            <button type="button" onClick={() => setType('outflow')} className="btn" style={{background: type === 'outflow' ? '#fee2e2' : '#f3f4f6', color: '#dc2626', border: type === 'outflow' ? '1px solid #dc2626' : 'none'}}>- Outflow</button>
          </div>
          <input type="number" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input type="text" placeholder="Note (Optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-primary">Save Transaction</button>
        </form>
      </div>

      <h3>History</h3>
      {transactions.length === 0 && <p style={{color: '#999', textAlign: 'center'}}>No transactions recorded yet.</p>}
      {transactions.map(t => (
        <div key={t.id} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px'}}>
          <div>
            <div style={{fontWeight: 'bold'}}>{t.note || 'Cash Entry'}</div>
            <div style={{fontSize: '11px', color: '#666'}}>{t.date}</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <span style={{color: t.type === 'inflow' ? '#16a34a' : '#dc2626', fontWeight: 'bold'}}>
              {t.type === 'inflow' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
            </span>
            <button onClick={() => deleteTransaction(t.id)} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px'}}>×</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;