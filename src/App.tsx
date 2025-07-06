import React, { useState, useEffect } from 'react';
import './App.css';

interface UserAccount {
  id?: number;
  name: string;
  address: string;
  dateOfBirth: string;
  ssn: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'BUSINESS';
  dollars: string | number;
}

interface DatabaseStats {
  oracleCount: number;
  db2Count: number;
  totalCount: number;
}

interface SagaResponse {
  message: string;
  sagaId: string;
  status: string;
  oracleId: number;
  db2Id: number;
  completedSteps: number;
  errors: string[];
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
  const [activeTab, setActiveTab] = useState<'form' | 'oracle' | 'db2' | 'stats' | 'monitoring'>('form');
  const [sagaMetrics, setSagaMetrics] = useState<any>(null);
  const [sagaHealth, setSagaHealth] = useState<any>(null);

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

  const fetchMonitoringData = async () => {
    try {
      const [metricsResponse, healthResponse] = await Promise.all([
        fetch('http://localhost:8080/api/accounts/monitoring/metrics'),
        fetch('http://localhost:8080/api/accounts/monitoring/health')
      ]);

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setSagaMetrics(metricsData);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSagaHealth(healthData);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchMonitoringData();
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
        const result: SagaResponse = await response.json();
        const statusColor = result.status === 'Completed' ? 'success' : 'error';
        const statusIcon = result.status === 'Completed' ? '✅' : '❌';
        
        setMessage(`${statusIcon} ${result.message} (SAGA ID: ${result.sagaId})`);
        
        // Refresh data
        fetchAccounts();
        fetchMonitoringData();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || response.statusText}`);
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
    <div className="account-list">
      <h2>{databaseName} Accounts ({accounts.length})</h2>
      {accounts.length === 0 ? (
        <p className="no-accounts">No accounts found in {databaseName}.</p>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account, index) => (
            <div key={account.id || index} className="account-card">
              <h3>{account.name}</h3>
              <p><strong>SSN:</strong> {account.ssn}</p>
              <p><strong>Address:</strong> {account.address}</p>
              <p><strong>Date of Birth:</strong> {formatDate(account.dateOfBirth)}</p>
              <p><strong>Account Type:</strong> {account.accountType}</p>
              <p><strong>Balance:</strong> {formatCurrency(account.dollars)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="stats-container">
      <h2>Database Statistics</h2>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Oracle Database</h3>
            <p className="stat-number">{stats.oracleCount}</p>
            <p className="stat-label">Accounts</p>
          </div>
          <div className="stat-card">
            <h3>DB2 Database</h3>
            <p className="stat-number">{stats.db2Count}</p>
            <p className="stat-label">Accounts</p>
          </div>
          <div className="stat-card total">
            <h3>Total</h3>
            <p className="stat-number">{stats.totalCount}</p>
            <p className="stat-label">Accounts</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonitoring = () => (
    <div className="monitoring-container">
      <h2>SAGA Monitoring Dashboard</h2>
      
      {sagaHealth && (
        <div className="health-status">
          <h3>System Health</h3>
          <div className={`health-indicator ${sagaHealth.status.toLowerCase()}`}>
            <span className="status-text">{sagaHealth.status}</span>
            <span className="success-rate">Success Rate: {sagaHealth.successRate?.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {sagaMetrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Execution Metrics</h3>
            <p><strong>Total Executions:</strong> {sagaMetrics.totalExecutions}</p>
            <p><strong>Completed:</strong> {sagaMetrics.completedExecutions}</p>
            <p><strong>Failed:</strong> {sagaMetrics.failedExecutions}</p>
            <p><strong>Compensating:</strong> {sagaMetrics.compensatingExecutions}</p>
          </div>
          
          <div className="metric-card">
            <h3>Performance</h3>
            <p><strong>Avg Oracle Time:</strong> {sagaMetrics.avgOracleExecutionTimeMs?.toFixed(2)}ms</p>
            <p><strong>Avg DB2 Time:</strong> {sagaMetrics.avgDb2ExecutionTimeMs?.toFixed(2)}ms</p>
            <p><strong>Total Compensations:</strong> {sagaMetrics.totalCompensations}</p>
            <p><strong>Total Failures:</strong> {sagaMetrics.totalFailures}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏦 Dual Database User Account Management</h1>
        <p>Powered by SAGA Pattern for Distributed Transactions</p>
      </header>

      <main className="App-main">
        <nav className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            📝 Create Account
          </button>
          <button 
            className={`tab-button ${activeTab === 'oracle' ? 'active' : ''}`}
            onClick={() => setActiveTab('oracle')}
          >
            🗄️ Oracle Accounts
          </button>
          <button 
            className={`tab-button ${activeTab === 'db2' ? 'active' : ''}`}
            onClick={() => setActiveTab('db2')}
          >
            🗄️ DB2 Accounts
          </button>
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
          <button 
            className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            🔍 SAGA Monitoring
          </button>
        </nav>

        {activeTab === 'form' && (
          <div className="content-container">
            <div className="form-container">
              <h2>Create New User Account</h2>
              <p className="form-description">
                This will create an account using the SAGA pattern, ensuring data consistency across both databases.
              </p>
              
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
                    placeholder="John Doe"
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
                    placeholder="123 Main St, City, State"
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
                  <label htmlFor="ssn">Social Security Number:</label>
                  <input
                    type="text"
                    id="ssn"
                    name="ssn"
                    value={formData.ssn}
                    onChange={handleInputChange}
                    required
                    placeholder="123-45-6789"
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
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>
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

        {activeTab === 'monitoring' && (
          <div className="content-container">
            {renderMonitoring()}
          </div>
        )}

        <div className="info-section">
          <h3>About This Application</h3>
          <p>This application demonstrates a dual-database setup using the <strong>SAGA pattern</strong>:</p>
          <ul>
            <li><strong>Frontend:</strong> React with TypeScript</li>
            <li><strong>Backend:</strong> Spring Boot with JPA</li>
            <li><strong>Databases:</strong> Oracle and DB2 (simulated with H2)</li>
            <li><strong>Transaction Management:</strong> SAGA pattern with compensation logic</li>
          </ul>
          <p><strong>SAGA Pattern Benefits:</strong></p>
          <ul>
            <li>✅ <strong>Data Consistency:</strong> Automatic compensation on failures</li>
            <li>✅ <strong>Better Performance:</strong> No 2PC overhead</li>
            <li>✅ <strong>Resilience:</strong> Handles partial failures gracefully</li>
            <li>✅ <strong>Observability:</strong> Clear execution tracking and monitoring</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
