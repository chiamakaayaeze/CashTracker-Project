import React, { useState, useEffect } from 'react';
// 1. Recharts imports for the visual dashboard
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- SUB-COMPONENT: LOGIN VIEW ---
const LoginView = ({ setUser }) => {
  const handleEmailLogin = () => {
    const email = prompt("Enter your Gmail Address:");
    if (email) {
      const userData = { email };
      localStorage.setItem('user_auth', JSON.stringify(userData));
      setUser(userData);
    }
  };

  return (
    <div className="login-screen">
      <nav className="login-nav">
        <button className="login-nav-item">Home</button>
        <button className="login-nav-item active">About us</button>
        <button className="login-nav-item">Contact us</button>
        <button className="login-nav-item">FAQs</button>
      </nav>
      <h1 style={{ fontSize: '32px', marginBottom: '10px', color: 'white' }}>Welcome to CashTrack 💸</h1>
      <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: 'white' }}>Take control of your financial story.</p>
      <button className="social-btn" onClick={() => alert('Coming Soon')}>Continue with Google</button>
      <div className="login-divider">or</div>
      <button className="email-login-btn" onClick={handleEmailLogin}>Log in with Email</button>
    </div>
  );
};

// --- SUB-COMPONENT: BUSINESS SETUP ---
const SetupView = ({ setProfile }) => {
  const [bizName, setBizName] = useState('');
  const [bizType, setBizType] = useState('Retailer');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const data = { name: bizName, category: bizType };
    setProfile(data);
    localStorage.setItem('cashtrack_profile', JSON.stringify(data));
  };

  return (
    <div className="login-screen">
      <div className="card" style={{ width: '100%', maxWidth: '350px', padding: '30px' }}>
        <h2 style={{ color: '#1a202c', textAlign: 'center' }}>Business Setup</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="input-group">
            <label style={{ fontWeight: 'bold' }}>Business Name</label>
            <input 
              type="text" 
              value={bizName} 
              onChange={(e) => setBizName(e.target.value)} 
              placeholder="e.g. My Boutique" 
              required 
            />
          </div>
          <div className="input-group" style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Business Category</label>
            <select value={bizType} onChange={(e) => setBizType(e.target.value)}>
              <option value="Retailer">Retailer</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Online Vendor">Online Vendor</option>
              <option value="Service Provider">Service Provider</option>
            </select>
          </div>
          <button className="email-login-btn" style={{ width: '100%', marginTop: '25px' }}>Save & Continue</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  // --- STATES ---
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user_auth')));
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('cashtrack_profile')));
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('cashtrack_data')) || []);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('inflow');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  // --- EFFECTS ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('cashtrack_data', JSON.stringify(transactions));
  }, [transactions]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    setUser(null);
  };

  const addTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    const newEntry = { id: Date.now(), amount: Number(amount), note, type, date: new Date().toISOString() };
    setTransactions([newEntry, ...transactions]);
    setAmount(''); setNote('');
  };

  const downloadReport = () => {
    const reportHeader = `CASHTRACK REPORT - ${selectedMonth}\nBusiness: ${profile?.name || 'My Business'}\n--------------------------\n`;
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    const reportRows = filtered.map(t => `${new Date(t.date).toLocaleDateString()} | ${t.type.toUpperCase()} | ${t.note || 'Cash'} | ₦${t.amount}`).join('\n');
    const blob = new Blob([reportHeader + reportRows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${selectedMonth}.txt`;
    link.click();
  };

  // --- CHART COMPONENT ---
  const CashflowChart = ({ data }) => {
    const chartData = data.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
      const existing = acc.find(item => item.name === date);
      if (existing) {
        existing[t.type] += t.amount;
      } else {
        acc.push({ name: date, inflow: t.type === 'inflow' ? t.amount : 0, outflow: t.type === 'outflow' ? t.amount : 0 });
      }
      return acc;
    }, []).slice(-5);

    return (
      <div className="card" style={{ height: '250px', marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>Sales vs Restock Costs (Weekly)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // --- VIEW DEFINITIONS ---
  const DashboardView = () => {
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    const totalIn = filtered.filter(t => t.type === 'inflow').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = filtered.filter(t => t.type === 'outflow').reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalIn - totalOut;

    return (
      <div className="container" style={{ background: 'var(--ministat-bg)', minHeight: '100vh' }}>
        
        <header className="header-dark">
          <h3 style={{ margin: 0 }}>CashTracker</h3>
          <button 
            className="theme-toggle-btn" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        

        <div style={{ marginTop: '15px' }}>
          <h2 style={{ margin: 0 }}>Welcome back, {profile.name}! 👋</h2>
        </div>

        <div className="type-toggle">
          <button 
            type="button"
            className={`toggle-btn ${type === 'inflow' ? 'active-in' : ''}`}
            onClick={() => setType('inflow')}
          >Daily Sales (In)</button>
          <button 
            type="button"
            className={`toggle-btn ${type === 'outflow' ? 'active-out' : ''}`}
            onClick={() => setType('outflow')}
          >Restock/Bills (Out)</button>
        </div>

        <div className="amount-input-box">
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            className="big-amount-input"
            placeholder="0.00"
          />
        </div>

        <button className="btn btn-primary" style={{ borderRadius: '50px' }} onClick={addTransaction}>
          Save Transaction ✅
        </button>

        <CashflowChart data={filtered} />

        <div className="mini-grid" style={{ marginTop: '20px' }}>
          <div className="mini-stat-card" style={{ background: '#10b981' }}>
             <div>Daily Sales</div>
             <div style={{ fontWeight: 'bold' }}>₦{totalIn.toLocaleString()}</div>
          </div>
          <div className="mini-stat-card" style={{ background: '#ef4444' }}>
             <div>Stock Expenses</div>
             <div style={{ fontWeight: 'bold' }}>₦{totalOut.toLocaleString()}</div>
          </div>
          <div className="mini-stat-card" style={{ background: '#3b82f6' }}>
             <div>Net Profit</div>
             <div style={{ fontWeight: 'bold' }}>₦{netProfit.toLocaleString()}</div>
          </div>
        </div>

        <h3 style={{marginTop: '25px'}}>Recent History</h3>
        {filtered.slice(0, 5).map(t => (
          <div key={t.id} className="card flex-between" style={{padding: '12px 15px'}}>
            <div><b>{t.note || 'Cash Entry'}</b><br/><small>{new Date(t.date).toLocaleDateString()}</small></div>
            <span style={{color: t.type === 'inflow' ? '#10b981' : '#ef4444', fontWeight: 'bold'}}>
              {t.type === 'inflow' ? '+' : '-'} ₦{t.amount.toLocaleString()}
            </span>
          </div>
        ))}
        <button onClick={downloadReport} className="btn" style={{marginTop: '15px', background: '#3b82f6', color: 'white'}}>Download Monthly Report</button>
      </div>
    );
  };

  const FAQView = () => (
    <div className="container">
      <h2>FAQ</h2>
      <div className="card"><strong>Is it free?</strong><p>Yes, the MVP version is free to use.</p></div>
      <div className="card"><strong>Where is my data?</strong><p>Data is stored locally on your device.</p></div>
      <div className="card"><strong>What is CASHTRACK?</strong><p>CASHTRACK is a lightweight tool built for small business owners and retailers to track daily sales and expenses without complex accounting.</p></div>
      <div className="card"><strong>How do I start tracking?</strong><p>Simply login, set up your business profile, and use the 'Daily Sales' or 'Restock' buttons to log transactions.</p></div>
      <div className="card"><strong>Can I use it for multiple businesses?</strong><p>Currently, CASHTRACK supports one business profile per browser session. You can edit your profile in the 'Profile' tab.</p></div>
      <div className="card"><strong>Is there a Dark Mode?</strong><p>Yes, you can toggle between Light and Dark modes using the moon/sun icon at the top of your Dashboard.</p></div>
      <div className="card"><strong>Does this app work offline?</strong><p>Yes, since data is stored locally, you can record transactions even without an internet connection.</p></div>
      <div className="card"><strong>Can I delete a wrong entry?</strong><p>Yes, in the 'History' section, click the '×' button next to any transaction to remove it.</p></div>
      <div className="card"><strong>What currency does it use?</strong><p>The app defaults to Naira (₦), but you can record any numeric value.</p></div>
      <div className="card"><strong>Is CASHTRACK a mobile app?</strong><p>It is a Web App optimized for mobile devices, meaning it looks and feels like an app on your phone's browser.</p></div>
      <div className="card"><strong>Can I use this for personal finance?</strong><p>While built for businesses, you can use it for personal budgeting by setting your 'Business Name' to your own name.</p></div>
      <div className="card"><strong>How do I contact support?</strong><p>Navigate to the 'Support' tab in the bottom menu to send us a direct message.</p></div>
      <div className="card"><strong>How do I download my financial reports?</strong><p>Go to the Dashboard, select your desired month, and click 'Download Report' to save a .txt file.</p></div>
    </div>
  );

  const ContactView = () => (
    <div className="container">
      <div className="card" style={{ background: '#1a202c', color: 'white', textAlign: 'center', padding: '20px' }}>
        <h4>Email Support</h4>
        <p>support@cashtrack.com</p>
      </div>
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Send a Message</h3>
        <form onSubmit={(e) => { e.preventDefault(); alert('Sent!'); }}>
          <input placeholder="Name" required />
          <textarea placeholder="Message" rows="4" style={{width: '100%', marginTop: '10px', borderRadius: '8px', padding: '10px'}}></textarea>
          <button className="btn btn-primary" style={{marginTop: '10px'}}>Send</button>
        </form>
      </div>
    </div>
  );

  // --- GATEKEEPERS ---
  if (!user) return <LoginView setUser={setUser} />;
  if (!profile) return <SetupView setProfile={setProfile} />;

  // --- RENDER VIEW LOGIC ---
  return (
    <div style={{ paddingBottom: '100px' }}>
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'about' && (
        <div className="container">
          <h2 style={{ color: 'var(--text-main)' }}>About CashTrack</h2>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' }}>
            <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>The Vision</h3>
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)' }}>
              <strong>"Know your cash. Control your business."</strong>
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
              Unlike traditional accounting apps, CashTrack is built specifically for small and informal Nigerian businesses. 
            </p>
          </div>
          <div className="card">
            <h3 style={{ color: '#ef4444', marginTop: 0 }}>The Challenge</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
              Many small business owners lack real-time visibility into their daily cash inflows and outflows. 
            </p>
          </div>
          <div className="card">
            <h3 style={{ color: '#10b981', marginTop: 0 }}>The Solution</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
              We provide a simple, low-effort daily cash tracking tool that delivers clarity.
            </p>
          </div>
          <div className="card" style={{ border: '1px solid #c9a84d' }}>
            <h3 style={{ color: '#c9a84d', marginTop: 0 }}>Who It's For</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>
              Small and informal business owners, traders, and SMEs.
            </p>
          </div>
        </div>
      )}
      {currentView === 'faq' && <FAQView />}
      {currentView === 'contact' && <ContactView />}

      <nav className="nav-bar">
        <button className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setCurrentView('dashboard')}>Home</button>
        <button className={currentView === 'about' ? 'active' : ''} onClick={() => setCurrentView('about')}>About</button>
        <button className={currentView === 'faq' ? 'active' : ''} onClick={() => setCurrentView('faq')}>FAQ</button>
        <button className={currentView === 'contact' ? 'active' : ''} onClick={() => setCurrentView('contact')}>Contact</button>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
};

export default App;