// ============================================
// EJEMPLOS DE CÓDIGO - COMPONENTES ESTILIZADOS
// ============================================

// ============================================
// 1. NAVBAR EXAMPLE
// ============================================

/*
Archivo: client/src/components/Navbar.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.scss';

export const AppNavbar = () => {
  return (
    <nav className="navbar navbar-dark">
      <div className="navbar-brand">🏛️ VOTACIONES SIA</div>
      <div className="nav-links">
        <a href="/dashboard" className="nav-link">Dashboard</a>
        <a href="/campaigns" className="nav-link">Campañas</a>
        <a href="/profile" className="nav-link">Perfil</a>
        <button className="btn btn-outline">Logout</button>
      </div>
    </nav>
  );
};
*/

// ============================================
// 2. STATS DASHBOARD EXAMPLE
// ============================================

/*
Archivo: client/src/components/StatsGrid.tsx

import React from 'react';
import '../styles/components/StatsGrid.scss';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className={`stats-card ${color ? `border-${color}` : ''}`}>
      <div className="stat-label">{icon} {label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-detail ${color || ''}`}>
        +12.5% vs último mes
      </div>
    </div>
  );
};

export const StatsGrid = () => {
  return (
    <div className="dashboard-grid">
      <StatCard label="Campañas Activas" value="8" icon="📊" color="success" />
      <StatCard label="Votos Registrados" value="2,345" icon="✓" />
      <StatCard label="Usuarios Registrados" value="156" icon="👥" color="warning" />
      <StatCard label="Tasa de Participación" value="78%" icon="📈" />
    </div>
  );
};
*/

// ============================================
// 3. CAMPAIGN CARD EXAMPLE
// ============================================

/*
Archivo: client/src/components/CampaignCard.tsx

import React from 'react';
import '../styles/components/CampaignCard.scss';

interface CampaignCardProps {
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  voteCount: number;
  onVote?: () => void;
  onEdit?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  title,
  description,
  status,
  voteCount,
  onVote,
  onEdit
}) => {
  const badgeColor = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    pending: 'badge-pending'
  }[status];

  return (
    <div className="campaign-card">
      <div className="campaign-header">
        <h4 className="campaign-title">{title}</h4>
      </div>
      <div className="campaign-body">
        <p className="campaign-description">{description}</p>
      </div>
      <div className="campaign-footer">
        <span className={`badge ${badgeColor}`}>
          {status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Pendiente'}
        </span>
        <span className="vote-count">{voteCount} votos</span>
        <button className="btn btn-sm btn-primary" onClick={onVote}>
          Votar
        </button>
        {onEdit && (
          <button className="btn btn-sm btn-outline" onClick={onEdit}>
            Editar
          </button>
        )}
      </div>
    </div>
  );
};
*/

// ============================================
// 4. FORM SECTION EXAMPLE
// ============================================

/*
Archivo: client/src/components/ProfileForm.tsx

import React, { useState } from 'react';
import '../styles/components/ProfileForm.scss';

export const ProfileForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission
  };

  return (
    <div className="form-section">
      <h3 className="section-title">📝 Información Básica</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              type="text"
              id="nombre"
              placeholder="Ej: Juan Pérez García"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              placeholder="+502 1234-5678"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección</label>
            <input
              type="text"
              id="direccion"
              placeholder="Calle, número..."
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            💾 Guardar Cambios
          </button>
          <button type="reset" className="btn btn-outline">
            ↺ Descartar
          </button>
        </div>
      </form>
    </div>
  );
};
*/

// ============================================
// 5. CANDIDATE VOTING EXAMPLE
// ============================================

/*
Archivo: client/src/components/CandidateVoting.tsx

import React, { useState } from 'react';
import '../styles/components/CandidateVoting.scss';

interface Candidate {
  id: number;
  name: string;
  party: string;
  image?: string;
}

interface CandidateVotingProps {
  candidates: Candidate[];
  onVote: (candidateId: number) => Promise<void>;
}

export const CandidateVoting: React.FC<CandidateVotingProps> = ({
  candidates,
  onVote
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (candidateId: number) => {
    setLoading(true);
    try {
      await onVote(candidateId);
      setSelectedId(candidateId);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidates-grid">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className={`candidate-card ${selectedId === candidate.id ? 'selected' : ''}`}
        >
          <div className="candidate-image">
            {candidate.image ? (
              <img src={candidate.image} alt={candidate.name} />
            ) : (
              <div style={{ background: '#e0e0e0', width: '100%', height: '100%' }} />
            )}
          </div>
          <div className="candidate-info">
            <h4 className="candidate-name">{candidate.name}</h4>
            <p className="candidate-party">{candidate.party}</p>
            <button
              className={`vote-btn ${selectedId === candidate.id ? 'voted' : ''}`}
              onClick={() => handleVote(candidate.id)}
              disabled={loading}
            >
              {selectedId === candidate.id ? '✓ Votado' : '🗳️ Votar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
*/

// ============================================
// 6. ALERT MESSAGES EXAMPLE
// ============================================

/*
Archivo: client/src/components/AlertMessage.tsx

import React from 'react';
import '../styles/components/AlertMessage.scss';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertMessageProps {
  message: string;
  type: AlertType;
  icon?: string;
  onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  type,
  icon,
  onClose
}) => {
  const icons = {
    success: '✓',
    danger: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`alert alert-${type}`}>
      <span>{icon || icons[type]} {message}</span>
      {onClose && (
        <button onClick={onClose} className="close-btn">×</button>
      )}
    </div>
  );
};

// Uso:
// <AlertMessage type="success" message="¡Operación exitosa!" />
// <AlertMessage type="danger" message="Ha ocurrido un error" />
*/

// ============================================
// 7. DATA TABLE EXAMPLE
// ============================================

/*
Archivo: client/src/components/VotersTable.tsx

import React from 'react';
import '../styles/components/DataTable.scss';

interface Voter {
  id: number;
  nombre: string;
  email: string;
  registro: string;
  estado: 'activo' | 'inactivo';
}

interface VotersTableProps {
  voters: Voter[];
}

export const VotersTable: React.FC<VotersTableProps> = ({ voters }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Fecha de Registro</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {voters.map((voter) => (
          <tr key={voter.id}>
            <td>#{voter.id}</td>
            <td>{voter.nombre}</td>
            <td>{voter.email}</td>
            <td>{new Date(voter.registro).toLocaleDateString()}</td>
            <td>
              <span className={`status-badge ${voter.estado}`}>
                {voter.estado}
              </span>
            </td>
            <td>
              <button className="btn btn-sm btn-primary">Ver</button>
              <button className="btn btn-sm btn-outline">Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
*/

// ============================================
// 8. PROFILE HEADER EXAMPLE
// ============================================

/*
Archivo: client/src/pages/ProfilePage.tsx

import React from 'react';
import '../styles/pages/ProfilePage.scss';

interface ProfileData {
  nombre: string;
  username: string;
  avatar?: string;
  rol: string;
  fechaRegistro: string;
}

export const ProfileHeader: React.FC<{ profile: ProfileData }> = ({ profile }) => {
  return (
    <div className="profile-header">
      <img
        src={profile.avatar || '/default-avatar.png'}
        alt={profile.nombre}
        className="profile-image"
      />
      <div className="profile-info">
        <h1 className="profile-name">{profile.nombre}</h1>
        <span className="profile-role">{profile.rol}</span>
        <div className="profile-meta">
          <p>@{profile.username}</p>
          <p>Miembro desde {new Date(profile.fechaRegistro).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};
*/

// ============================================
// 9. LOGIN FORM EXAMPLE
// ============================================

/*
Archivo: client/src/pages/LoginPage.tsx - Ya implementado

import React, { useState } from 'react';
import '../styles/pages/LoginPage.scss';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            {/* Logo image */}
          </div>
          <h1>Iniciar Sesión</h1>
          <p className="subtitle">Sistema de Votaciones SIA</p>
        </div>

        <div className="login-body">
          {error && <div className="error-message">{error}</div>}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <span className="icon">👤</span>
                Usuario
              </label>
              <input
                type="text"
                placeholder="Tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <span className="icon">🔒</span>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
          </form>

          <div className="login-divider">
            <span>¿Necesitas ayuda?</span>
          </div>
        </div>

        <div className="login-footer">
          <div className="help-links">
            <a href="#forgot">Olvidé mi contraseña</a>
            <a href="#support">Contactar soporte</a>
          </div>
        </div>
      </div>
    </div>
  );
};
*/

// ============================================
// 10. RESPONSIVE GRID EXAMPLE
// ============================================

/*
Archivo: client/src/components/ResponsiveGrid.tsx

import React from 'react';
import '../styles/components/ResponsiveGrid.scss';

export const ResponsiveGrid = () => {
  return (
    <>
      {/* Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column */}
      <div className="dashboard-grid">
        <div className="card">Elemento 1</div>
        <div className="card">Elemento 2</div>
        <div className="card">Elemento 3</div>
        <div className="card">Elemento 4</div>
      </div>

      {/* Grid de candidatos: Más grande, scrollable en mobile */}
      <div className="candidates-grid">
        <div className="candidate-card">Candidato 1</div>
        <div className="candidate-card">Candidato 2</div>
        <div className="candidate-card">Candidato 3</div>
      </div>
    </>
  );
};
*/

// ============================================
// EXPORT EJEMPLOS
// ============================================

export const EJEMPLOS_COMPONENTES = {
  navbar: 'Navbar.tsx',
  stats: 'StatsGrid.tsx',
  campaign: 'CampaignCard.tsx',
  form: 'ProfileForm.tsx',
  voting: 'CandidateVoting.tsx',
  alerts: 'AlertMessage.tsx',
  table: 'VotersTable.tsx',
  profile: 'ProfileHeader.tsx',
  login: 'LoginPage.tsx',
  grid: 'ResponsiveGrid.tsx'
};

// ============================================
// NOTAS IMPORTANTES
// ============================================

/*
📌 RECORDAR:

1. Siempre importar los estilos SCSS:
   import '../styles/components/MiComponente.scss';

2. Usar clases del sistema de diseño:
   className="btn btn-primary"
   className="card"
   className="form-group"
   className="alert alert-success"

3. Usar variables SCSS en archivos personalizados:
   @import '../styles/variables';
   color: $primary-dark;
   padding: $lg;

4. Respetar la paleta de colores:
   - Primario: Azul oscuro (#001a4d)
   - Acentos: Dorado (#F4A500)
   - Estado: Verde éxito, Rojo error, Naranja warning

5. Utilizar transiciones estándar:
   transition: all $transition-base;
   
6. Responsive primero:
   Empezar con estilos mobile
   Luego @media (min-width: $breakpoint-md)

7. No hardcodear colores:
   ✓ background: $primary-dark;
   ✗ background: #001a4d;

8. Mantener coherencia:
   - Bordes: 2px para inputs, 4px para headers
   - Sombras: Usar variables ($shadow-md, etc)
   - Espaciado: Múltiplos de $spacing-unit (8px)
*/
