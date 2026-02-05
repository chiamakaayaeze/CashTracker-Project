import React, { useState, useEffect } from 'react';



const App = () => {
  // --- AUTH & NAVIGATION STATE ---
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user_auth')));
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // --- APP DATA STATE ---
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('cashtrack_profile')));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('cashtrack_data')) || []);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('inflow');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  // --- THEME SYNC ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- DATA PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('cashtrack_data', JSON.stringify(transactions));
  }, [transactions]);

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const userData = { email: e.target.email.value };
    setUser(userData);
    localStorage.setItem('user_auth', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    setUser(null);
    setCurrentView('login');
  };

  const addTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    const newEntry = {
      id: Date.now(),
      amount: Number(amount),
      note,
      type,
      date: new Date().toISOString()
    };
    setTransactions([newEntry, ...transactions]);
    setAmount(''); setNote('');
  };

  const downloadReport = () => {
    const reportHeader = `CASHTRACK REPORT - ${selectedMonth}\nBusiness: ${profile?.name}\n--------------------------\n`;
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    const reportRows = filtered.map(t => 
      `${new Date(t.date).toLocaleDateString()} | ${t.type.toUpperCase()} | ${t.note || 'Cash'} | ₦${t.amount}`
    ).join('\n');
    
    const blob = new Blob([reportHeader + reportRows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${selectedMonth}.txt`;
    link.click();
  };

  // --- SUB-VIEWS (COMPONENTS) ---

const LoginView = ({ setUser }) => {
  return (
    <div className="login-screen">
      {/* Top Navigation Bar */}
      <nav className="login-nav">
        <button className="login-nav-item">Home</button>
        <button className="login-nav-item active">About us</button>
        <button className="login-nav-item">Contact us</button>
        <button className="login-nav-item">FAQs</button>
      </nav>

      {/* Hero Section */}
      <h1 style={{ fontSize: '32px', marginBottom: '10px', color: 'white' }}>
        Welcome to CashTrack 💸
      </h1>
      <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: 'white' }}>
        Take control of your financial story with CashTrack.
      </p>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '40px' }}>
        Please log in to access your account and track your expenses and income
      </p>

      {/* Social Buttons */}
      <button className="social-btn" onClick={() => alert('Google Auth Coming Soon')}>
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="G" />
        Continue with Google
      </button>

      <button className="social-btn" onClick={() => alert('Apple Auth Coming Soon')}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" width="16" alt="A" />
        Continue with Apple
      </button>

      <div className="login-divider">or</div>

      {/* Email Login Action */}
      <button 
        className="email-login-btn" 
        onClick={() => {
          const email = prompt("Enter your Gmail Address:");
          if (email) {
            const userData = { email };
            setUser(userData);
            localStorage.setItem('user_auth', JSON.stringify(userData));
          }
        }}
      >
        Log in with Email
      </button>
    </div>
  );
};

  const DashboardView = () => {
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    const balance = filtered.reduce((acc, t) => t.type === 'inflow' ? acc + t.amount : acc - t.amount, 0);

    return (
      <div className="container">
        <header className="flex-between" style={{marginBottom: '20px'}}>
          <h2 style={{margin: 0}}>Dashboard</h2>
          <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{padding: '8px'}}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        <div className="card" style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white'}}>
          <p style={{margin: 0, opacity: 0.8}}>Monthly Balance ({selectedMonth})</p>
          <h1 style={{fontSize: '32px', margin: '10px 0'}}>₦{balance.toLocaleString()}</h1>
          <button onClick={downloadReport} className="btn" style={{background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '12px'}}>Download Report</button>
        </div>

        <div className="card">
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>

        <div className="card">
          <h3>Record Transaction</h3>
          <form onSubmit={addTransaction}>
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
              <button type="button" onClick={() => setType('inflow')} className="btn" style={{flex: 1, background: type === 'inflow' ? 'var(--inflow)' : 'var(--bg-color)', color: type === 'inflow' ? 'white' : 'var(--text-sub)'}}>Inflow</button>
              <button type="button" onClick={() => setType('outflow')} className="btn" style={{flex: 1, background: type === 'outflow' ? 'var(--outflow)' : 'var(--bg-color)', color: type === 'outflow' ? 'white' : 'var(--text-sub)'}}>Outflow</button>
            </div>
            <input type="number" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input type="text" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn btn-primary" style={{marginTop: '10px'}}>Save Record</button>
          </form>
        </div>

        <h3>History</h3>
        {filtered.map(t => (
          <div key={t.id} className="card flex-between" style={{padding: '12px 15px'}}>
            <div>
              <div style={{fontWeight: 'bold', fontSize: '14px'}}>{t.note || 'Cash Entry'}</div>
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

  // --- RENDER LOGIC ---
  if (!user) return <LoginView />;

  return (
    <div style={{paddingBottom: '100px'}}>
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'about' && (
        <div className="container">
          <h2>About</h2>
          <div className="card"><p>Cashtrack helps small businesses track daily inflows and outflows to make better financial decisions.</p></div>
        </div>
      )}
      {currentView === 'faq' && (
        <div className="container">
          <h2>FAQ</h2>
          <div className="card"><strong>Is it free?</strong><p>Yes, the MVP version is free to use.</p></div>
        <div className="card"><strong>What is CASHTRACK?</strong><p>CASHTRACK is a lightweight tool built for small business owners and retailers to track daily sales and expenses without complex accounting.</p></div>
<div className="card"><strong>How do I start tracking?</strong><p>Simply login, set up your business profile, and use the 'Daily Sales' or 'Restock' buttons to log transactions.</p></div>
       <div className="card"><strong>Where is my data stored?</strong><p>For your privacy, all data is stored locally on your browser. No one else can see your records.</p></div>
         <div className="card"><strong>Can I use it for multiple businesses?</strong><p>Currently, CASHTRACK supports one business profile per browser session. You can edit your profile in the 'Profile' tab.</p></div>
         <div className="card"><strong>How do I download my financial reports?</strong><p>Go to the Dashboard, select your desired month, and click 'Download Report' to save a .txt file.</p></div>
        <div className="card"><strong>What does 'Net Profit' mean?</strong><p>It is the total amount left after subtracting your 'Restock/Bills' from your 'Daily Sales'."</p></div>
        </div>
      )}
      {currentView === 'contact' && (
        <div className="container" style={{ paddingBottom: '100px' }}>
          {/* 1. Information Header (Matches your image) */}
          <div className="card" style={{ background: '#1a202c', color: 'white', textAlign: 'center', padding: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '24px' }}>✉️</div>
                <h4 style={{ margin: '10px 0 5px' }}>Email Support</h4>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>support@cashtrack.com</p>
              </div>
              <div>
                <div style={{ fontSize: '24px' }}>🕒</div>
                <h4 style={{ margin: '10px 0 5px' }}>Response Time</h4>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>Within 24 hours</p>
              </div>
              <div>
                <div style={{ fontSize: '24px' }}>🌐</div>
                <h4 style={{ margin: '10px 0 5px' }}>Languages</h4>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>English & Yoruba</p>
              </div>
            </div>
          </div>

          {/* 2. The Contact Form */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Send us a Message</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px' }}>
              Have a specific question about your business records? Fill out the form below.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message received! We will get back to you soon.'); }}>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="input-group" style={{ marginTop: '15px' }}>
                <label>Subject</label>
                <select required>
                  <option value="">Select a topic</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing/Pricing</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="input-group" style={{ marginTop: '15px' }}>
                <label>Message</label>
                <textarea 
                  style={{ 
                    width: '100%', 
                    borderRadius: '12px', 
                    padding: '12px', 
                    marginTop: '8px', 
                    border: '1px solid var(--border)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }} 
                  rows="5" 
                  placeholder="Tell us how we can help..." 
                  required
                ></textarea>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '20px', borderRadius: '50px' }}>
                Send Message 🚀
              </button>
            </form>
          </div>
        </div>
      )}
      

      {/* Navigation Footer */}
      <nav className="nav-bar">
        <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>Home</button>
        <button className={`nav-item ${currentView === 'about' ? 'active' : ''}`} onClick={() => setCurrentView('about')}>About</button>
        <button className={`nav-item ${currentView === 'faq' ? 'active' : ''}`} onClick={() => setCurrentView('faq')}>FAQ</button>
        <button className={`nav-item ${currentView === 'contact' ? 'active' : ''}`} onClick={() => setCurrentView('contact')}>Contact</button>
        <button className="nav-item" onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
};

export default App;