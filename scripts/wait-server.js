import net from 'net';

function check() {
  const socket = net.createConnection(5001, '127.0.0.1', () => {
    socket.destroy();
    process.exit(0);
  });
  socket.on('error', () => {
    setTimeout(check, 200);
  });
}

check();
