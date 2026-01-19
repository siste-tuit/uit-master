import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
// Componente para gráfico de producción
interface ProductionData {
  date?: string;
  fecha?: string;
  production?: number;
  produccion?: number;
  efficiency?: number;
  eficiencia?: number;
  quality?: number;
  calidad?: number;
}

interface ProductionChartProps {
  data: ProductionData[];
  periodo?: 'diaria' | 'semanal' | 'mensual';
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ data, periodo = 'mensual' }) => {
  // Formatear datos para el gráfico
  const chartData = (data || []).map(item => ({
    date: item.date || item.fecha,
    production: item.production || item.produccion || 0
  }));

  const getTitulo = () => {
    switch (periodo) {
      case 'diaria':
        return 'Producción Diaria';
      case 'semanal':
        return 'Producción Semanal';
      case 'mensual':
      default:
        return 'Producción Mensual';
    }
  };

  const getFormatoFecha = (value: string) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      switch (periodo) {
        case 'diaria':
          return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        case 'semanal':
          return `Sem ${date.toLocaleDateString('es-ES', { month: 'short' })}`;
        case 'mensual':
        default:
          return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  const getFormatoFechaTooltip = (value: string) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      switch (periodo) {
        case 'diaria':
          return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        case 'semanal':
          const inicioSemana = new Date(date);
          inicioSemana.setDate(date.getDate() - date.getDay());
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6);
          return `Semana del ${inicioSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${finSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        case 'mensual':
        default:
          return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTitulo()}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              tickFormatter={getFormatoFecha}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelFormatter={getFormatoFechaTooltip}
              formatter={(value: any) => [`${Number(value).toLocaleString()} unidades`, 'Producción']}
            />
            <Line 
              type="monotone" 
              dataKey="production" 
              stroke="#2E7D32" 
              strokeWidth={3}
              dot={{ fill: '#2E7D32', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2E7D32', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para gráfico de eficiencia
interface EfficiencyChartProps {
  data: ProductionData[];
  periodo?: 'diaria' | 'semanal' | 'mensual';
}

export const EfficiencyChart: React.FC<EfficiencyChartProps> = ({ data, periodo = 'mensual' }) => {
  // Formatear datos para el gráfico
  const chartData = (data || []).map(item => ({
    date: item.date || item.fecha,
    efficiency: item.efficiency || item.eficiencia || 0,
    quality: item.quality || item.calidad || 0
  }));

  const getTitulo = () => {
    switch (periodo) {
      case 'diaria':
        return 'Eficiencia y Calidad Diaria';
      case 'semanal':
        return 'Eficiencia y Calidad Semanal';
      case 'mensual':
      default:
        return 'Eficiencia y Calidad Mensual';
    }
  };

  const getFormatoFecha = (value: string) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      switch (periodo) {
        case 'diaria':
          return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        case 'semanal':
          return `Sem ${date.toLocaleDateString('es-ES', { month: 'short' })}`;
        case 'mensual':
        default:
          return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  const getFormatoFechaTooltip = (value: string) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      
      switch (periodo) {
        case 'diaria':
          return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        case 'semanal':
          const inicioSemana = new Date(date);
          inicioSemana.setDate(date.getDate() - date.getDay());
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6);
          return `Semana del ${inicioSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${finSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        case 'mensual':
        default:
          return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTitulo()}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              tickFormatter={getFormatoFecha}
            />
            <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelFormatter={getFormatoFechaTooltip}
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '']}
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stackId="1"
              stroke="#4CAF50"
              fill="#4CAF50"
              fillOpacity={0.3}
              name="Eficiencia"
            />
            <Area
              type="monotone"
              dataKey="quality"
              stackId="2"
              stroke="#66BB6A"
              fill="#66BB6A"
              fillOpacity={0.3}
              name="Calidad"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para gráfico financiero
interface FinancialChartData {
  month?: string;
  ingresos?: number;
  egresos?: number;
  utilidad?: number;
}

interface FinancialChartProps {
  data: FinancialChartData[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento Financiero</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Bar dataKey="revenue" fill="#2E7D32" name="Ingresos" />
            <Bar dataKey="expenses" fill="#f59e0b" name="Gastos" />
            <Bar dataKey="profit" fill="#4CAF50" name="Ganancias" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para gráfico de distribución de inventario
interface InventoryDistributionProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const InventoryDistribution: React.FC<InventoryDistributionProps> = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Inventario</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para gráfico de tendencias
interface TrendChartProps {
  data: Array<{
    period: string;
    value: number;
    target: number;
  }>;
  title: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2E7D32" 
              strokeWidth={3}
              dot={{ fill: '#2E7D32', strokeWidth: 2, r: 4 }}
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Meta"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
