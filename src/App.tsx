import React, { useState, useEffect } from 'react';
import './App.css';

interface UserAccount {
  id?: number;
  name: string;
  address: string;
  dateOfBirth: string;
  ssn: string;
  accountType: string;
  dollars: string | number;
}

interface DatabaseStats {
  oracleCount: number;
  db2Count: number;
  totalCount: number;
}

function App() {
  const [formData, setFormData] = useState<UserAccount>({
    name: '',
    address: '',
    dateOfBirth: '',
    ssn: '',
    accountType: 'CHECKING',
    dollars: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [oracleAccounts, setOracleAccounts] = useState<UserAccount[]>([]);
  const [db2Accounts, setDb2Accounts] = useState<UserAccount[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'oracle' | 'db2' | 'stats'>('form');

  const fetchAccounts = async () => {
    try {
      const [oracleResponse, db2Response, statsResponse] = await Promise.all([
        fetch('http://localhost:8080/api/accounts/oracle'),
        fetch('http://localhost:8080/api/accounts/db2'),
        fetch('http://localhost:8080/api/accounts/stats')
      ]);

      if (oracleResponse.ok) {
        const oracleData = await oracleResponse.json();
        setOracleAccounts(oracleData);
      }

      if (db2Response.ok) {
        const db2Data = await db2Response.json();
        setDb2Accounts(db2Data);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dollars: parseFloat(formData.dollars as string) || 0
        }),
      });

      if (response.ok) {
        const result = await response.text();
        setMessage(`Success: ${result}`);
        setFormData({
          name: '',
          address: '',
          dateOfBirth: '',
          ssn: '',
          accountType: 'CHECKING',
          dollars: ''
        });
        // Refresh the accounts and stats
        fetchAccounts();
      } else {
        setMessage(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const renderAccountList = (accounts: UserAccount[], databaseName: string) => (
    <div className="accounts-list">
      <h3>{databaseName} Accounts ({accounts.length})</h3>
      {accounts.length === 0 ? (
        <p className="no-accounts">No accounts found in {databaseName} database.</p>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account, index) => (
            <div key={account.id || index} className="account-card">
              <div className="account-header">
                <h4>{account.name}</h4>
                <span className={`account-type ${account.accountType.toLowerCase()}`}>
                  {account.accountType}
                </span>
              </div>
              <div className="account-details">
                <p><strong>Address:</strong> {account.address}</p>
                <p><strong>DOB:</strong> {formatDate(account.dateOfBirth)}</p>
                <p><strong>SSN:</strong> {account.ssn}</p>
                <p><strong>Balance:</strong> {formatCurrency(account.dollars)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="stats-container">
      <h3>Database Statistics</h3>
      {stats ? (
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Oracle Database</h4>
            <div className="stat-number">{stats.oracleCount}</div>
            <p>Accounts</p>
          </div>
          <div className="stat-card">
            <h4>DB2 Database</h4>
            <div className="stat-number">{stats.db2Count}</div>
            <p>Accounts</p>
          </div>
          <div className="stat-card total">
            <h4>Total</h4>
            <div className="stat-number">{stats.totalCount}</div>
            <p>Accounts</p>
          </div>
        </div>
      ) : (
        <p>Loading statistics...</p>
      )}
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Account Management</h1>
        <p>Create accounts that will be saved to both Oracle and DB2 databases</p>
      </header>
      
      <nav className="App-nav">
        <button 
          className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Create Account
        </button>
        <button 
          className={`nav-btn ${activeTab === 'oracle' ? 'active' : ''}`}
          onClick={() => setActiveTab('oracle')}
        >
          Oracle Accounts
        </button>
        <button 
          className={`nav-btn ${activeTab === 'db2' ? 'active' : ''}`}
          onClick={() => setActiveTab('db2')}
        >
          DB2 Accounts
        </button>
        <button 
          className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </nav>
      
      <main className="App-main">
        {activeTab === 'form' && (
          <div className="form-container">
            <h2>Create New Account</h2>
            <form onSubmit={handleSubmit} className="account-form">
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth:</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ssn">SSN:</label>
                <input
                  type="text"
                  id="ssn"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  required
                  placeholder="XXX-XX-XXXX"
                  pattern="\d{3}-\d{2}-\d{4}"
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountType">Account Type:</label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dollars">Initial Balance ($):</label>
                <input
                  type="number"
                  id="dollars"
                  name="dollars"
                  value={formData.dollars}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {message && (
              <div className={`message ${message.startsWith('Success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </div>
        )}

        {activeTab === 'oracle' && (
          <div className="content-container">
            {renderAccountList(oracleAccounts, 'Oracle')}
          </div>
        )}

        {activeTab === 'db2' && (
          <div className="content-container">
            {renderAccountList(db2Accounts, 'DB2')}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="content-container">
            {renderStats()}
          </div>
        )}

        <div className="info-section">
          <h3>About This Application</h3>
          <p>This application demonstrates a dual-database setup using:</p>
          <ul>
            <li><strong>Frontend:</strong> React with TypeScript</li>
            <li><strong>Backend:</strong> Spring Boot with JPA</li>
            <li><strong>Databases:</strong> Oracle and DB2 (simulated with H2)</li>
            <li><strong>Transaction Management:</strong> Atomikos JTA for distributed transactions</li>
          </ul>
          <p>When you create an account, it will be saved to both databases in a single transaction.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
