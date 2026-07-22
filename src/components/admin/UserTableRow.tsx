'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/admin/users/users.module.css';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface UserTableRowProps {
  user: User;
}

export function UserTableRow({ user }: UserTableRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user status');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <tr>
      <td>
        <Link href={`/admin/users/${user.id}`} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
          {user.name || '-'}
        </Link>
      </td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
        <span className={user.active ? styles.badgeActive : styles.badgeInactive}>
          {user.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleToggleStatus}
            disabled={isLoading || user.role === 'admin'}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
          >
            {isLoading ? '...' : user.active ? 'Deactivate' : 'Activate'}
          </button>
          <Link href={`/admin/users/${user.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
            Profile
          </Link>
        </div>
      </td>
    </tr>
  );
}
