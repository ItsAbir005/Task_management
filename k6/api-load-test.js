import http from 'k6/http';
import { check, fail, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const options = {
  scenarios: {
    employee: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 60 },
        { duration: '1m', target: 60 },
        { duration: '30s', target: 0 },
      ],
      exec: 'employeeFlow',
    },
    manager: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 0 },
      ],
      exec: 'managerFlow',
    },
    hr: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 15 },
        { duration: '1m', target: 15 },
        { duration: '30s', target: 0 },
      ],
      exec: 'hrFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  return {
    employee: login(__ENV.TEST_EMAIL || 'charlie@hrm.com'),
    manager: login(__ENV.MANAGER_EMAIL || 'alice@hrm.com'),
    hr: login(__ENV.HR_EMAIL || 'bob@hrm.com'),
  };
}

function login(email) {
  const response = http.post(`${baseUrl}/api/auth/employeeLogin`, JSON.stringify({
    email,
    password: __ENV.TEST_PASSWORD || 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'load-test-login' },
  });

  const token = response.json('token');
  if (response.status !== 200 || !token) {
    fail(`Load-test login failed for ${email} with status ${response.status}.`);
  }

  return token;
}

function get(path, token, name) {
  return http.get(`${baseUrl}${path}`, {
    cookies: { token },
    tags: { name },
  });
}

function checkResponse(response, name) {
  check(response, {
    [`${name} returns 200`]: (result) => result.status === 200,
  });
}

export function employeeFlow(tokens) {
  checkResponse(get('/api/auth/me', tokens.employee, 'employee-me'), 'employee me');
  checkResponse(get('/api/admin/emp-dashboard-stats', tokens.employee, 'employee-dashboard'), 'employee dashboard');
  checkResponse(get('/api/admin/emp-tasks', tokens.employee, 'employee-tasks'), 'employee tasks');
  checkResponse(get('/api/notifications', tokens.employee, 'employee-notifications'), 'employee notifications');
  sleep(1);
}

export function managerFlow(tokens) {
  checkResponse(get('/api/auth/me', tokens.manager, 'manager-me'), 'manager me');
  checkResponse(get('/api/admin/manager-dashboard-stats', tokens.manager, 'manager-dashboard'), 'manager dashboard');
  checkResponse(get('/api/admin/manager-projects', tokens.manager, 'manager-projects'), 'manager projects');
  checkResponse(get('/api/admin/manager-tasks', tokens.manager, 'manager-tasks'), 'manager tasks');
  sleep(1);
}

export function hrFlow(tokens) {
  checkResponse(get('/api/auth/me', tokens.hr, 'hr-me'), 'hr me');
  checkResponse(get('/api/admin/hr-dashboard-stats', tokens.hr, 'hr-dashboard'), 'hr dashboard');
  checkResponse(get('/api/admin/getHRLeave', tokens.hr, 'hr-leaves'), 'hr leaves');
  sleep(1);
}