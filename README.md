# Dual Database User Account Management System

This application demonstrates a dual-database setup using Spring Boot with JPA and Atomikos JTA for distributed transactions. The system saves user accounts to both Oracle and DB2 databases (simulated with H2) in a single transaction.

## 🏗️ Architecture

- **Frontend**: React with TypeScript
- **Backend**: Spring Boot with JPA
- **Databases**: Oracle and DB2 (simulated with H2)
- **Transaction Management**: Atomikos JTA for distributed transactions
- **Build Tools**: Maven (Backend), npm (Frontend)

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- npm or yarn
- Maven 3.6 or higher

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd /path/to/your/project

# The project structure should be:
# ├── frontend/          # React application
# └── backend/           # Spring Boot application
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Clean and compile the project
mvn clean compile

# Run the Spring Boot application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🎯 Features

### Frontend Features
- **Create Account Form**: Add new user accounts with validation
- **Account Display**: View accounts from both Oracle and DB2 databases
- **Statistics Dashboard**: See account counts from both databases
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatically refreshes data after account creation

### Backend Features
- **Dual Database Support**: Saves to both Oracle and DB2 simultaneously
- **Distributed Transactions**: Uses Atomikos JTA for transaction management
- **RESTful API**: Clean REST endpoints for account management
- **Health Check**: Endpoint to verify backend status
- **Statistics API**: Get account counts from both databases

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts` | Create a new account in both databases |
| GET | `/api/accounts/oracle` | Get all accounts from Oracle database |
| GET | `/api/accounts/db2` | Get all accounts from DB2 database |
| GET | `/api/accounts/stats` | Get account statistics from both databases |
| GET | `/api/accounts/health` | Health check endpoint |

### Account Data Structure

```json
{
  "name": "John Doe",
  "address": "123 Main St, City, State",
  "dateOfBirth": "1990-01-01",
  "ssn": "123-45-6789",
  "accountType": "CHECKING",
  "dollars": 1000.00
}
```

## 🗄️ Database Configuration

The application uses H2 in-memory databases to simulate Oracle and DB2:

- **Oracle Database**: `jdbc:h2:mem:oracledb`
- **DB2 Database**: `jdbc:h2:mem:db2db`

Both databases are configured with:
- Auto-creation of tables (`spring.jpa.hibernate.ddl-auto=create-drop`)
- SQL logging enabled for debugging
- Atomikos JTA transaction management

## 🔧 Configuration Files

### Backend Configuration
- `backend/src/main/resources/application.properties` - Database and JTA configuration
- `backend/pom.xml` - Maven dependencies and build configuration

### Frontend Configuration
- `frontend/package.json` - npm dependencies and scripts
- `frontend/tsconfig.json` - TypeScript configuration

## 🧪 Testing the Application

1. **Start both applications** (backend and frontend)
2. **Navigate to** `http://localhost:3000`
3. **Create an account** using the form
4. **View accounts** in the Oracle and DB2 tabs
5. **Check statistics** in the Statistics tab

### Sample Test Data

Try creating an account with this data:
- Name: John Smith
- Address: 456 Oak Avenue, New York, NY
- Date of Birth: 1985-06-15
- SSN: 111-22-3333
- Account Type: Savings
- Initial Balance: 2500.00

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure Java 17+ is installed: `java -version`
   - Check Maven installation: `mvn -version`
   - Verify port 8080 is available

2. **Frontend won't start**
   - Ensure Node.js 16+ is installed: `node -version`
   - Check npm installation: `npm -version`
   - Verify port 3000 is available

3. **CORS errors**
   - Backend has CORS configured for all origins
   - If issues persist, check browser console for specific errors

4. **Database connection errors**
   - H2 databases are in-memory and reset on application restart
   - Check application.properties for correct configuration

### Logs and Debugging

- **Backend logs**: Check console output when running `mvn spring-boot:run`
- **Frontend logs**: Check browser developer tools console
- **Database logs**: SQL queries are logged to console (enabled in application.properties)

## 📁 Project Structure

```
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── App.css          # Styling
│   │   └── index.tsx        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/main/java/com/example/
│   │   ├── BackendApplication.java
│   │   ├── UserAccount.java
│   │   ├── UserAccountController.java
│   │   ├── UserAccountService.java
│   │   ├── config/
│   │   │   └── DatabaseConfig.java
│   │   ├── oracle/
│   │   │   └── OracleUserAccountRepository.java
│   │   └── db2/
│   │       └── Db2UserAccountRepository.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
└── README.md
```

## 🔄 Development Workflow

1. **Make changes** to frontend or backend code
2. **Restart applications** if needed
   - Frontend: Usually hot-reloads automatically
   - Backend: Restart with `mvn spring-boot:run`
3. **Test changes** in the browser
4. **Check logs** for any errors

## 🚀 Production Deployment

For production deployment, consider:

1. **Replace H2 with real databases**:
   - Oracle Database
   - IBM DB2 Database
2. **Configure proper connection pools**
3. **Set up proper CORS configuration**
4. **Add authentication and authorization**
5. **Configure logging and monitoring**
6. **Set up CI/CD pipelines**

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
