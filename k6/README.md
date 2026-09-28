# k6 load test

Start PostgreSQL from the repository root:

```powershell
docker compose up -d db
```

In a first PowerShell terminal, start the backend:

```powershell
cd backend
npm start
```

Leave that terminal running. Open a second PowerShell terminal in the
repository root for the load test.

Install k6 on Windows if it is not already available:

```powershell
winget install k6 --source winget
```

If `k6` is not recognized in an already-open terminal, either open a new
PowerShell window or run it by its installed path:

```powershell
& 'C:\Program Files\k6\k6.exe' run .\k6\api-load-test.js
```

To refresh PATH in the current PowerShell session:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
```

Run the default test from the second terminal:

```powershell
k6 run .\k6\api-load-test.js
```

Use a different server URL when needed:

```powershell
$env:BASE_URL = 'http://localhost:4000'
k6 run .\k6\api-load-test.js
```

The test exercises representative authenticated workflows for employee, manager,
and HR users. It logs in once per role during `setup()`, then distributes 100 VUs
across current-user, dashboard, task, project, leave, and notification endpoints.

Run it with the seeded accounts:

```powershell
$env:TEST_PASSWORD = 'password123'
k6 run .\k6\api-load-test.js
```

Override the role accounts when needed:

```powershell
$env:TEST_EMAIL = 'employee@example.com'
$env:MANAGER_EMAIL = 'manager@example.com'
$env:HR_EMAIL = 'hr@example.com'
$env:TEST_PASSWORD = '<password>'
k6 run .\k6\api-load-test.js
```

The test checks that fewer than 1% of requests fail and the 95th percentile stays
below 500 ms. Invalid credentials or an invalid cookie fail during setup with a
clear error instead of generating misleading load-test results.

For this 100-VU test and repeated local runs, raise the development API limit
when starting the backend so requests do not return `429`:

```powershell
$env:API_RATE_LIMIT_MAX = '100000'
npm start
```