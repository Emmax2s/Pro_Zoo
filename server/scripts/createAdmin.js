import readline from 'node:readline/promises';
import bcrypt from 'bcrypt';
import { stdin as input, stdout as output } from 'node:process';
import { query, getPool } from '../config/db.js';

const rl = readline.createInterface({ input, output });

try {
  const username = (await rl.question('Usuario: ')).trim();
  const email = (await rl.question('Correo: ')).trim().toLowerCase();
  const name = (await rl.question('Nombre: ')).trim() || username;
  const password = await rl.question('Contraseña (mínimo 10 caracteres): ', { hideEchoBack: true });

  if (!username || !email || password.length < 10) {
    throw new Error('Usuario, correo y una contraseña de al menos 10 caracteres son obligatorios.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query(
    `INSERT INTO admin_users (username, email, display_name, role, password)
     VALUES ($1, $2, $3, 'superadmin', $4)`,
    [username, email, name, passwordHash]
  );
  console.log('Administrador creado correctamente.');
} catch (error) {
  if (error.code === '23505') {
    console.error('El usuario o correo ya existe.');
    process.exitCode = 1;
  } else {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
} finally {
  rl.close();
  await getPool().end();
}
