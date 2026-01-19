import React, { useState } from 'react';

// Tipos para el ERP
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  permissions: string[];
}

interface UserRole {
  id: string;
  name: string;
  level: number; // 1 = Gerente (máximo), 2 = Ingeniero, 3 = Mecánico, 4 = Líneas
  color: string;
  description: string;
  modules: string[];
  icon: string;
}

interface ProductionLine {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'stopped';
  efficiency: number;
  operator: string;
  currentProduct: string;
  target: number;
  produced: number;
}

interface Material {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  cost: number;
  supplier: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  materials: string[];
  price: number;
  status: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  materials: string[];
}

// Paleta de colores profesional - Verde predominante
const colors = {
  primary: '#2E7D32',      // Verde oscuro como principal
  secondary: '#4CAF50',    // Verde profesional
  dark: '#1A1A1A',         // Negro elegante
  darkGray: '#2D2D2D',     // Gris oscuro
  lightGray: '#F8F9FA',    // Gris claro
  white: '#FFFFFF',
  accent: '#66BB6A',       // Verde claro
  success: '#1B5E20',      // Verde muy oscuro
  warning: '#FF6B35',      // Naranja como acento
  text: '#333333',
  textLight: '#666666',
  border: '#E0E0E0'
};

// Definición de Roles del Sistema
const userRoles: UserRole[] = [
  {
    id: 'manager',
    name: 'Gerente',
    level: 1,
    color: colors.dark,
    description: 'Acceso completo al sistema',
    modules: ['dashboard', 'materials', 'products', 'suppliers', 'customers', 'purchases', 'sales', 'production', 'inventory', 'users', 'reports'],
    icon: '👔'
  },
  {
    id: 'engineer',
    name: 'Ingeniero',
    level: 2,
    color: colors.primary,
    description: 'Supervisión técnica y producción',
    modules: ['dashboard', 'materials', 'products', 'production', 'inventory', 'reports'],
    icon: '🔧'
  },
  {
    id: 'mechanic',
    name: 'Mecánico',
    level: 3,
    color: colors.warning,
    description: 'Mantenimiento y reparaciones',
    modules: ['dashboard', 'production', 'materials', 'reports'],
    icon: '🔨'
  }
];

// Líneas de Producción
const productionLines: ProductionLine[] = Array.from({ length: 13 }, (_, i) => ({
  id: `line_${i + 1}`,
  name: `Línea ${i + 1}`,
  status: i < 8 ? 'active' : i < 10 ? 'maintenance' : 'stopped',
  efficiency: Math.floor(Math.random() * 30) + 70, // 70-100%
  operator: `Operador L${i + 1}`,
  currentProduct: `Producto ${i + 1}`,
  target: 1000 + (i * 100),
  produced: Math.floor(Math.random() * 800) + 200
}));

// Crear roles para cada línea de producción
const lineRoles: UserRole[] = productionLines.map(line => ({
  id: line.id,
  name: `Operador ${line.name}`,
  level: 4,
  color: colors.accent,
  description: `Operador de ${line.name} - Producción textil`,
  modules: ['dashboard', 'production', 'reports'],
  icon: '🏭'
}));

// Todos los roles del sistema
const allRoles = [...userRoles, ...lineRoles];

// Componente de Login
const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const demoUsers: User[] = [
    { 
      id: 1, 
      name: 'Carlos Mendoza', 
      email: 'gerente@textil.com', 
      role: allRoles[0], // Gerente
      department: 'Gerencia',
      permissions: allRoles[0].modules
    },
    { 
      id: 2, 
      name: 'Ana Rodríguez', 
      email: 'ingeniero@textil.com', 
      role: allRoles[1], // Ingeniero
      department: 'Ingeniería',
      permissions: allRoles[1].modules
    },
    { 
      id: 3, 
      name: 'Miguel Torres', 
      email: 'mecanico@textil.com', 
      role: allRoles[2], // Mecánico
      department: 'Mantenimiento',
      permissions: allRoles[2].modules
    },
    { 
      id: 4, 
      name: 'Línea 1 Operador', 
      email: 'linea1@textil.com', 
      role: allRoles[3], // Línea 1
      department: 'Producción',
      permissions: allRoles[3].modules
    },
    { 
      id: 5, 
      name: 'Línea 5 Operador', 
      email: 'linea5@textil.com', 
      role: allRoles[7], // Línea 5
      department: 'Producción',
      permissions: allRoles[7].modules
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    // Verificar credenciales básicas
    if (formData.password === 'demo123') {
      setShowRoleSelection(true);
      setError('');
    } else {
      setError('Contraseña incorrecta. Usa: demo123');
    }
  };

  const handleRoleSelection = (roleId: string) => {
    const selectedRole = allRoles.find(r => r.id === roleId);
    if (selectedRole) {
      const user: User = {
        id: Math.floor(Math.random() * 1000),
        name: selectedRole.name === 'Gerente' ? 'Carlos Mendoza' : 
              selectedRole.name === 'Ingeniero' ? 'Ana Rodríguez' :
              selectedRole.name === 'Mecánico' ? 'Miguel Torres' :
              `Operador ${selectedRole.name}`,
        email: formData.email,
        role: selectedRole,
        department: selectedRole.level <= 3 ? 
          (selectedRole.name === 'Gerente' ? 'Gerencia' : 
           selectedRole.name === 'Ingeniero' ? 'Ingeniería' : 'Mantenimiento') : 
          'Producción',
        permissions: selectedRole.modules
      };
      onLogin(user);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Patrón de fondo elegante */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(46, 125, 50, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.3) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        background: colors.white,
        borderRadius: '16px',
        padding: showRoleSelection ? '30px' : '50px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 25px rgba(255,107,53,0.2)',
        maxWidth: showRoleSelection ? '700px' : '450px',
        width: '100%',
        position: 'relative',
        border: `2px solid ${colors.border}`,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo profesional */}
        <div style={{
          width: '80px',
          height: '80px',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          borderRadius: '20px',
          margin: '0 auto 25px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 25px ${colors.primary}40`,
          position: 'relative'
        }}>
          <span style={{ fontSize: '40px', color: colors.white }}>🏭</span>
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: colors.secondary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '12px', color: colors.white }}>✓</span>
          </div>
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          margin: '0 0 8px 0',
          background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px'
        }}>
          ERP TEXTIL
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.textLight,
          margin: '0 0 40px 0',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          Sistema de Gestión Empresarial Profesional
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Correo electrónico corporativo"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                background: colors.lightGray,
                outline: 'none',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.background = colors.white;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.background = colors.lightGray;
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>
          
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <input
              type="password"
              placeholder="Contraseña de acceso"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                background: colors.lightGray,
                outline: 'none',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.background = colors.white;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.background = colors.lightGray;
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              boxShadow: `0 8px 25px ${colors.primary}40`,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 12px 35px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${colors.primary}40`;
            }}
          >
            🔐 Acceder al Sistema
          </button>
        </form>

        {/* Selección de Roles */}
        {showRoleSelection && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.dark,
              margin: '0 0 20px 0',
              textAlign: 'center'
            }}>
              Selecciona tu Rol
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {allRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelection(role.id)}
                  style={{
                    background: colors.lightGray,
                    border: `2px solid ${role.color}30`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${role.color}10`;
                    e.currentTarget.style.borderColor = role.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.lightGray;
                    e.currentTarget.style.borderColor = `${role.color}30`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {role.icon}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: role.color,
                    marginBottom: '5px'
                  }}>
                    {role.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textLight,
                    lineHeight: '1.4'
                  }}>
                    {role.description}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRoleSelection(false)}
              style={{
                background: 'transparent',
                border: `2px solid ${colors.textLight}`,
                color: colors.textLight,
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.dark;
                e.currentTarget.style.color = colors.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.textLight;
                e.currentTarget.style.color = colors.textLight;
              }}
            >
              ← Volver
            </button>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#FFEBEE',
            color: '#C62828',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            border: '2px solid #FFCDD2'
          }}>
            ⚠️ {error}
          </div>
        )}

        {!showRoleSelection && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: `linear-gradient(135deg, ${colors.secondary}10 0%, ${colors.primary}10 100%)`,
            borderRadius: '12px',
            fontSize: '14px',
            color: colors.textLight,
            border: `1px solid ${colors.secondary}30`
          }}>
            <div style={{ fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
              🎯 Credenciales de Demostración
            </div>
            <div style={{ lineHeight: '1.6' }}>
              <strong>Email:</strong> Cualquier email válido<br/>
              <strong>Contraseña:</strong> demo123<br/>
              <strong>Después selecciona tu rol</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Dashboard
const Dashboard: React.FC<{ user: User; onNavigate: (module: string) => void }> = ({ user, onNavigate }) => {
  const userModules = user.permissions.filter(module => module !== 'dashboard');
  const allModules = [
    { id: 'materials', name: 'Materiales', icon: '📦', desc: 'Gestionar materias primas', color: colors.primary },
    { id: 'products', name: 'Productos', icon: '🏷️', desc: 'Catálogo de productos', color: colors.secondary },
    { id: 'suppliers', name: 'Proveedores', icon: '🚚', desc: 'Gestión de proveedores', color: colors.accent },
    { id: 'customers', name: 'Clientes', icon: '👥', desc: 'Base de datos de clientes', color: colors.success },
    { id: 'purchases', name: 'Compras', icon: '🛒', desc: 'Órdenes de compra', color: colors.primary },
    { id: 'sales', name: 'Ventas', icon: '💰', desc: 'Gestión de ventas', color: colors.secondary },
    { id: 'production', name: 'Producción', icon: '🏭', desc: 'Planificación de producción', color: colors.accent },
    { id: 'inventory', name: 'Inventario', icon: '📊', desc: 'Control de stock', color: colors.success },
    { id: 'users', name: 'Usuarios', icon: '👤', desc: 'Gestión de usuarios', color: colors.warning },
    { id: 'reports', name: 'Reportes', icon: '📈', desc: 'Análisis y reportes', color: colors.dark }
  ];

  const modules = allModules.filter(module => userModules.includes(module.id));

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%)`,
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header Profesional */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
        padding: '25px 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Patrón de fondo del header */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 15px ${colors.primary}40`
            }}>
              <span style={{ fontSize: '24px', color: colors.white }}>🏭</span>
            </div>
            <div>
              <h1 style={{
                margin: '0',
                color: colors.white,
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '-0.5px'
              }}>
                ERP TEXTIL
              </h1>
              <p style={{
                margin: '5px 0 0 0',
                color: `${colors.white}CC`,
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                Sistema de Gestión Empresarial Profesional
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
            padding: '12px 20px',
            borderRadius: '12px',
            border: `1px solid ${colors.primary}30`
          }}>
            <p style={{
              margin: '0',
              color: colors.white,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Bienvenido, <span style={{ color: colors.primary }}>{user.name}</span>
            </p>
            <p style={{
              margin: '5px 0 0 0',
              color: `${colors.white}AA`,
              fontSize: '13px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {user.role.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 30px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            margin: '0 0 10px 0',
            color: colors.dark,
            fontSize: '32px',
            fontWeight: '700',
            letterSpacing: '-1px'
          }}>
            📋 Módulos del Sistema
          </h2>
          <p style={{
            margin: '0',
            color: colors.textLight,
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Selecciona un módulo para acceder a sus funcionalidades
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '25px',
          marginBottom: '50px'
        }}>
          {modules.map((module, index) => (
            <div
              key={module.id}
              onClick={() => onNavigate(module.id)}
              style={{
                background: colors.white,
                padding: '30px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `2px solid ${colors.border}`,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px ${module.color}20`;
                e.currentTarget.style.borderColor = module.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              {/* Indicador de color */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${module.color} 0%, ${module.color}80 100%)`
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: `linear-gradient(135deg, ${module.color}20 0%, ${module.color}10 100%)`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  border: `2px solid ${module.color}30`
                }}>
                  <span style={{ fontSize: '28px' }}>{module.icon}</span>
                </div>
                <div>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    color: colors.dark,
                    fontSize: '22px',
                    fontWeight: '700',
                    letterSpacing: '-0.5px'
                  }}>
                    {module.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: module.color,
                      borderRadius: '50%'
                    }} />
                    <span style={{
                      color: colors.textLight,
                      fontSize: '13px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Módulo {index + 1}
                    </span>
                  </div>
                </div>
              </div>
              
              <p style={{
                margin: '0',
                color: colors.textLight,
                fontSize: '15px',
                lineHeight: '1.6',
                fontWeight: '500'
              }}>
                {module.desc}
              </p>
              
              <div style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  color: module.color,
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Acceder →
                </span>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}80 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Cards Profesionales */}
        <div style={{
          background: colors.white,
          padding: '35px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{
            margin: '0 0 30px 0',
            color: colors.dark,
            fontSize: '24px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>📊</span>
            Estado del Sistema
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              padding: '25px',
              background: `linear-gradient(135deg, ${colors.success}10 0%, ${colors.secondary}10 100%)`,
              borderRadius: '12px',
              border: `2px solid ${colors.success}30`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '12px',
                height: '12px',
                background: colors.success,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${colors.success}60`
              }} />
              <div style={{
                fontSize: '20px',
                fontWeight: '800',
                color: colors.success,
                marginBottom: '8px'
              }}>✅ Frontend</div>
              <div style={{
                fontSize: '14px',
                color: colors.textLight,
                fontWeight: '500'
              }}>Funcionando correctamente</div>
            </div>
            
            <div style={{
              padding: '25px',
              background: `linear-gradient(135deg, ${colors.warning}10 0%, ${colors.primary}10 100%)`,
              borderRadius: '12px',
              border: `2px solid ${colors.warning}30`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '12px',
                height: '12px',
                background: colors.warning,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${colors.warning}60`
              }} />
              <div style={{
                fontSize: '20px',
                fontWeight: '800',
                color: colors.warning,
                marginBottom: '8px'
              }}>⏳ Backend</div>
              <div style={{
                fontSize: '14px',
                color: colors.textLight,
                fontWeight: '500'
              }}>Pendiente de configuración</div>
            </div>
            
            <div style={{
              padding: '25px',
              background: `linear-gradient(135deg, ${colors.success}10 0%, ${colors.secondary}10 100%)`,
              borderRadius: '12px',
              border: `2px solid ${colors.success}30`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '12px',
                height: '12px',
                background: colors.success,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${colors.success}60`
              }} />
              <div style={{
                fontSize: '20px',
                fontWeight: '800',
                color: colors.success,
                marginBottom: '8px'
              }}>✅ DataGrid</div>
              <div style={{
                fontSize: '14px',
                color: colors.textLight,
                fontWeight: '500'
              }}>Sin errores de runtime</div>
            </div>
            
            <div style={{
              padding: '25px',
              background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}10 100%)`,
              borderRadius: '12px',
              border: `2px solid ${colors.primary}30`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '12px',
                height: '12px',
                background: colors.primary,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${colors.primary}60`
              }} />
              <div style={{
                fontSize: '20px',
                fontWeight: '800',
                color: colors.primary,
                marginBottom: '8px'
              }}>✅ Módulos</div>
              <div style={{
                fontSize: '14px',
                color: colors.textLight,
                fontWeight: '500'
              }}>8 módulos disponibles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard específico para operadores de línea
const ProductionLineDashboard: React.FC<{ user: User; onNavigate: (module: string) => void }> = ({ user, onNavigate }) => {
  const userLine = productionLines.find(line => line.id === user.role.id);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%)`,
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header del Dashboard de Línea */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
        padding: '25px 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%)`,
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 25px ${colors.accent}40`
          }}>
            <span style={{ fontSize: '28px' }}>🏭</span>
          </div>
          <div>
            <h1 style={{
              margin: '0',
              color: colors.white,
              fontSize: '28px',
              fontWeight: '800',
              letterSpacing: '-0.5px'
            }}>
              {userLine?.name || 'Línea de Producción'}
            </h1>
            <p style={{
              margin: '5px 0 0 0',
              color: `${colors.white}CC`,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Panel de Control de Producción
            </p>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
            padding: '15px 20px',
            borderRadius: '12px',
            border: `1px solid ${colors.primary}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ fontSize: '24px' }}>
              {user.role.icon}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: colors.white, fontSize: '16px', fontWeight: '700' }}>
                {user.name}
              </div>
              <div style={{ color: `${colors.white}CC`, fontSize: '12px', marginTop: '2px' }}>
                {user.role.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Dashboard */}
      <div style={{ padding: '40px 30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Estado de la Línea */}
        <div style={{
          background: colors.white,
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          marginBottom: '30px',
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.dark,
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📊 Estado Actual de la Línea
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Estado */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.secondary}10 0%, ${colors.primary}10 100%)`,
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${colors.secondary}30`
            }}>
              <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '5px' }}>
                Estado
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: userLine?.status === 'active' ? colors.success : 
                      userLine?.status === 'maintenance' ? colors.warning : colors.dark
              }}>
                {userLine?.status === 'active' ? '🟢 Activa' : 
                 userLine?.status === 'maintenance' ? '🟡 Mantenimiento' : '🔴 Detenida'}
              </div>
            </div>

            {/* Eficiencia */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}10 100%)`,
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${colors.primary}30`
            }}>
              <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '5px' }}>
                Eficiencia
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.primary
              }}>
                {userLine?.efficiency}%
              </div>
            </div>

            {/* Producto Actual */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.accent}10 0%, ${colors.secondary}10 100%)`,
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${colors.accent}30`
            }}>
              <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '5px' }}>
                Producto Actual
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: colors.accent
              }}>
                {userLine?.currentProduct}
              </div>
            </div>

            {/* Producción */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.success}10 0%, ${colors.primary}10 100%)`,
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${colors.success}30`
            }}>
              <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '5px' }}>
                Producción (Meta: {userLine?.target})
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.success
              }}>
                {userLine?.produced} unidades
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div style={{
          background: colors.white,
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.dark,
            margin: '0 0 20px 0'
          }}>
            ⚡ Acciones Rápidas
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {user.permissions.map((permission) => {
              if (permission === 'dashboard') return null;
              const moduleMap: { [key: string]: any } = {
                'materials': { id: 'materials', name: 'Materiales', icon: '📦', desc: 'Gestionar materias primas', color: colors.primary },
                'products': { id: 'products', name: 'Productos', icon: '🏷️', desc: 'Catálogo de productos', color: colors.secondary },
                'suppliers': { id: 'suppliers', name: 'Proveedores', icon: '🚚', desc: 'Gestión de proveedores', color: colors.accent },
                'customers': { id: 'customers', name: 'Clientes', icon: '👥', desc: 'Base de datos de clientes', color: colors.success },
                'purchases': { id: 'purchases', name: 'Compras', icon: '🛒', desc: 'Órdenes de compra', color: colors.primary },
                'sales': { id: 'sales', name: 'Ventas', icon: '💰', desc: 'Gestión de ventas', color: colors.secondary },
                'production': { id: 'production', name: 'Producción', icon: '🏭', desc: 'Planificación de producción', color: colors.accent },
                'inventory': { id: 'inventory', name: 'Inventario', icon: '📊', desc: 'Control de stock', color: colors.success },
                'users': { id: 'users', name: 'Usuarios', icon: '👤', desc: 'Gestión de usuarios', color: colors.warning },
                'reports': { id: 'reports', name: 'Reportes', icon: '📈', desc: 'Análisis y reportes', color: colors.dark }
              };
              const module = moduleMap[permission];
              if (!module) return null;
              
              return (
                <div
                  key={module.id}
                  onClick={() => onNavigate(module.id)}
                  style={{
                    background: `linear-gradient(135deg, ${module.color}10 0%, ${module.color}05 100%)`,
                    border: `2px solid ${module.color}30`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${module.color}20`;
                    e.currentTarget.style.borderColor = module.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${module.color}10`;
                    e.currentTarget.style.borderColor = `${module.color}30`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {module.icon}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: module.color,
                    marginBottom: '5px'
                  }}>
                    {module.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textLight,
                    lineHeight: '1.4'
                  }}>
                    {module.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const AppERP: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<string>('dashboard');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentModule('dashboard');
  };

  const handleNavigate = (module: string) => {
    setCurrentModule(module);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentModule('dashboard');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentModule === 'dashboard') {
    // Dashboard específico según el rol
    if (currentUser.role.level === 4) {
      // Dashboard para operadores de línea
      return <ProductionLineDashboard user={currentUser} onNavigate={handleNavigate} />;
    } else {
      return <Dashboard user={currentUser} onNavigate={handleNavigate} />;
    }
  }

  // Módulos específicos con diseño profesional - Verde predominante
  const moduleInfo = {
    materials: { name: 'Materiales', icon: '📦', color: colors.primary, desc: 'Gestión completa de materias primas' },
    products: { name: 'Productos', icon: '🏷️', color: colors.secondary, desc: 'Catálogo y gestión de productos' },
    suppliers: { name: 'Proveedores', icon: '🚚', color: colors.accent, desc: 'Base de datos de proveedores' },
    customers: { name: 'Clientes', icon: '👥', color: colors.success, desc: 'Gestión de clientes y contactos' },
    purchases: { name: 'Compras', icon: '🛒', color: colors.primary, desc: 'Órdenes y gestión de compras' },
    sales: { name: 'Ventas', icon: '💰', color: colors.secondary, desc: 'Ventas y facturación' },
    production: { name: 'Producción', icon: '🏭', color: colors.accent, desc: 'Planificación de producción' },
    inventory: { name: 'Inventario', icon: '📊', color: colors.success, desc: 'Control de stock y almacenes' }
  };

  const currentModuleInfo = moduleInfo[currentModule as keyof typeof moduleInfo] || moduleInfo.materials;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%)`,
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header Profesional del Módulo */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
        padding: '25px 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Patrón de fondo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${currentModuleInfo.color}20 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${currentModuleInfo.color}10 0%, transparent 50%)`,
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => setCurrentModule('dashboard')}
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              color: colors.white,
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 15px ${colors.primary}40`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 15px ${colors.primary}40`;
            }}
          >
            ← Dashboard
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: `linear-gradient(135deg, ${currentModuleInfo.color} 0%, ${currentModuleInfo.color}80 100%)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 15px ${currentModuleInfo.color}40`
            }}>
              <span style={{ fontSize: '24px', color: colors.white }}>{currentModuleInfo.icon}</span>
            </div>
            <div>
              <h1 style={{
                margin: '0',
                color: colors.white,
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '-0.5px'
              }}>
                {currentModuleInfo.name}
              </h1>
              <p style={{
                margin: '5px 0 0 0',
                color: `${colors.white}CC`,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {currentModuleInfo.desc}
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: `linear-gradient(135deg, ${currentModuleInfo.color}20 0%, ${colors.primary}20 100%)`,
            padding: '12px 20px',
            borderRadius: '12px',
            border: `1px solid ${currentModuleInfo.color}30`
          }}>
            <span style={{
              color: colors.white,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {currentUser.name} • {currentUser.role.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: `linear-gradient(135deg, #f44336 0%, #d32f2f 100%)`,
              color: colors.white,
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.4)';
            }}
          >
            🚪 Salir
          </button>
        </div>
      </div>

      {/* Contenido del Módulo */}
      <div style={{ padding: '40px 30px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          background: colors.white,
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Patrón de fondo del contenido */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 50%, ${currentModuleInfo.color}05 0%, transparent 70%)`,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: `linear-gradient(135deg, ${currentModuleInfo.color}20 0%, ${currentModuleInfo.color}10 100%)`,
              borderRadius: '30px',
              margin: '0 auto 30px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${currentModuleInfo.color}30`,
              boxShadow: `0 8px 25px ${currentModuleInfo.color}20`
            }}>
              <span style={{ fontSize: '60px' }}>{currentModuleInfo.icon}</span>
            </div>
            
            <h2 style={{
              margin: '0 0 20px 0',
              color: colors.dark,
              fontSize: '36px',
              fontWeight: '800',
              letterSpacing: '-1px',
              background: `linear-gradient(135deg, ${colors.dark} 0%, ${currentModuleInfo.color} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {currentModuleInfo.name}
            </h2>
            
            <p style={{
              color: colors.textLight,
              fontSize: '18px',
              fontWeight: '500',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 40px auto'
            }}>
              {currentModuleInfo.desc}. Este módulo está en desarrollo activo y próximamente tendrás acceso completo a todas las funcionalidades profesionales.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, ${colors.success}10 0%, ${colors.secondary}10 100%)`,
                borderRadius: '12px',
                border: `2px solid ${colors.success}30`
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.success, marginBottom: '5px' }}>
                  Diseño Completo
                </div>
                <div style={{ fontSize: '14px', color: colors.textLight }}>
                  Interfaz profesional lista
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, ${colors.warning}10 0%, ${colors.primary}10 100%)`,
                borderRadius: '12px',
                border: `2px solid ${colors.warning}30`
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚧</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.warning, marginBottom: '5px' }}>
                  En Desarrollo
                </div>
                <div style={{ fontSize: '14px', color: colors.textLight }}>
                  Funcionalidades en progreso
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent}10 100%)`,
                borderRadius: '12px',
                border: `2px solid ${colors.primary}30`
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, marginBottom: '5px' }}>
                  Próximamente
                </div>
                <div style={{ fontSize: '14px', color: colors.textLight }}>
                  CRUD completo disponible
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppERP;
