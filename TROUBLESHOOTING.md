# CivicConnect AI - Troubleshooting & Diagnostics Guide

This guide helps solve common developer and local environment configuration challenges.

---

## 1. MySQL Database Connection Issues

### Issue A: `Access denied for user 'root'@'localhost'`
* **Cause:** The default password in `application.properties` does not match your local MySQL root password.
* **Solution 1 (Set Environment Variable):**
  In PowerShell, set your actual MySQL root password before starting the backend:
  ```powershell
  $env:SPRING_DATASOURCE_PASSWORD = "your_mysql_password"
  ```
* **Solution 2 (Edit application.properties):**
  Open `backend/src/main/resources/application.properties` and update:
  ```properties
  spring.datasource.password=your_mysql_password
  ```

### Issue B: `Unknown database 'civicconnect_ai'`
* **Cause:** The database was not created before the application startup.
* **Solution:** Create the database with MySQL client:
  ```powershell
  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS civicconnect_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  ```
  Or ensure `createDatabaseIfNotExist=true` is present in `spring.datasource.url` in `application.properties`.

---

## 2. Port Conflicts

### Port 8080 already in use (Backend)
* **Check process using port 8080:**
  ```powershell
  Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  ```
* **Change port:** Edit `backend/src/main/resources/application.properties`:
  ```properties
  server.port=8081
  ```
  *(Remember to update `target: 'http://localhost:8081'` in `frontend/vite.config.js`).*

### Port 5173 already in use (Frontend)
Vite will automatically fall back to port `5174` or you can specify a port in `vite.config.js`:
```javascript
server: {
  port: 5175,
}
```

---

## 3. Java & Maven Troubleshooting

### Java version mismatch
CivicConnect AI requires **Java 21**. Verify your version:
```powershell
java -version
```
Expected output:
```
java version "21.x.x" ...
```
If an older Java version is set, configure `JAVA_HOME`:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
```

### Running Maven commands
Use the local Maven binary discovered in your environment:
```powershell
& "C:\Users\Shalini\.m2\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
```

---

## 4. Frontend & CORS

### CORS error during API requests
In development, Vite proxies requests from `http://localhost:5173/api` directly to `http://localhost:8080/api`.
Additionally, Spring Boot's `SecurityConfig.java` has explicit CORS configuration allowing:
```java
configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"));
```
If using a different frontend URL, add it to `SecurityConfig.java`.

---

## 5. File Upload Limit Exceeded

If uploading an image larger than 5MB:
* The client will display: *"File is too large. Maximum allowed image size is 5MB."*
* The server will catch `MaxUploadSizeExceededException` and return HTTP 413 Payload Too Large.
* To increase limits, update in `application.properties`:
  ```properties
  spring.servlet.multipart.max-file-size=10MB
  spring.servlet.multipart.max-request-size=20MB
  ```
