import http from 'http';
import { spawn } from 'child_process';

const services = [
  { name: 'Gateway', port: 5000, dir: 'services/api-gateway' },
  { name: 'User Service', port: 5001, dir: 'services/user-service' },
  { name: 'Resume Service', port: 5002, dir: 'services/resume-service' },
  { name: 'Interview Service', port: 5003, dir: 'services/interview-service' },
  { name: 'Feedback Service', port: 5004, dir: 'services/feedback-service' },
  { name: 'Roadmap Service', port: 5005, dir: 'services/roadmap-service' },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probeUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(4000, () => {
      req.destroy();
      reject(new Error(`Timeout probing ${url}`));
    });
  });
}

async function run() {
  console.log('--- Starting All 6 Microservices for Live Verification ---');
  const procs = [];

  for (const s of services) {
    console.log(`Starting ${s.name} on port ${s.port}...`);
    const p = spawn('node', ['index.js'], {
      cwd: s.dir,
      stdio: 'pipe',
      env: { ...process.env, PORT: String(s.port) }
    });

    p.stdout.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg.includes('running on port') || msg.includes('[INFO]')) {
        console.log(`  [${s.name}] ${msg}`);
      }
    });

    p.stderr.on('data', (d) => {
      const err = d.toString().trim();
      if (!err.includes('DeprecationWarning')) {
        console.error(`  [${s.name} ERR] ${err}`);
      }
    });

    procs.push(p);
  }

  // Wait 6 seconds for all services to bind to ports
  console.log('Waiting for microservices to initialize...');
  await wait(6000);

  console.log('\n--- Probing /health on all microservices ---');
  let allHealthy = true;

  for (const s of services) {
    try {
      const res = await probeUrl(`http://127.0.0.1:${s.port}/health`);
      console.log(`✓ [${s.name}] port ${s.port} /health responded ${res.status}:`, res.body?.status || res.body);
      if (res.status !== 200) allHealthy = false;
    } catch (err) {
      console.error(`✗ [${s.name}] port ${s.port} /health failed: ${err.message}`);
      allHealthy = false;
    }
  }

  console.log('\n--- Probing API Gateway Integration End-to-End ---');
  try {
    const authHeader = { Authorization: 'Bearer mock_token_demo_user_ankush_123' };

    // Test Gateway /api/me
    const meRes = await probeUrl('http://127.0.0.1:5000/api/me', authHeader);
    console.log(`✓ Gateway -> User-Service /api/me status ${meRes.status}:`, meRes.body?.data?.name || meRes.body);

    // Test Gateway /api/dashboard/stats
    const statsRes = await probeUrl('http://127.0.0.1:5000/api/dashboard/stats', authHeader);
    console.log(`✓ Gateway -> User-Service /api/dashboard/stats status ${statsRes.status}:`, {
      totals: statsRes.body?.data?.totals,
      questionsSolved: statsRes.body?.data?.questionsSolved,
      completed: statsRes.body?.data?.completed,
      averageScore: statsRes.body?.data?.averageScore
    });

    // Test Gateway /api/roadmaps
    const roadmapRes = await probeUrl('http://127.0.0.1:5000/api/roadmaps', authHeader);
    console.log(`✓ Gateway -> Roadmap-Service /api/roadmaps status ${roadmapRes.status}: Array length ${roadmapRes.body?.data?.length ?? 0}`);

  } catch (err) {
    console.error(`✗ Gateway integration error: ${err.message}`);
    allHealthy = false;
  }

  // Gracefully terminate all background test processes
  console.log('\nTerminating verification processes...');
  for (const p of procs) {
    p.kill('SIGTERM');
  }

  if (allHealthy) {
    console.log('\n🎉 ALL MICROSERVICES & API GATEWAY HEALTH CHECKS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('\n❌ Some health checks or integration calls failed.\n');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

