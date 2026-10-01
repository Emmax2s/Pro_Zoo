import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, UserPlus } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

interface AdminUser {
  id: number;
  username: string;
  created_at: string;
}

export function AdminUsers() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      const token = sessionStorage.getItem("pro-zoo-admin-token");
      const res = await fetch(`${API_BASE_URL}/api/admin/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error("Failed to fetch admins", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!newUsername || !newPassword) {
      setError('Por favor completa todos los campos.');
      setIsLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("pro-zoo-admin-token");
      const res = await fetch(`${API_BASE_URL}/api/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Administrador creado correctamente.');
        setNewUsername('');
        setNewPassword('');
        fetchAdmins();
      } else {
        setError(data.message || 'Error al crear administrador.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Añadir Administrador
        </h3>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">{success}</div>}
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <Input 
              value={newUsername} 
              onChange={e => setNewUsername(e.target.value)}
              placeholder="Ej. nuevo_admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <Input 
              type="password"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
            />
          </div>
          <div>
            <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
              {isLoading ? 'Creando...' : 'Crear Administrador'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-green-800 mb-4">Administradores Registrados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Fecha de Creación</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{admin.username}</td>
                  <td className="px-6 py-4">{new Date(admin.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center">No se encontraron administradores.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
