module.exports = {
  apps: [{
    name: 'react-app',
    script: 'npx',
    args: 'vite --host 0.0.0.0 --port 5173',
    cwd: '/root/Sp',
    instances: 1,
    autorestart: true,
    watch: false
  }]
};

