import { useQuery } from '@tanstack/react-query';
import { getUnitMovements } from '../services/reports';
import { exportToCsv } from '../utils/exportToCsv';
import { useMemo } from 'react';

export default function UnitAccountSection({ unitId, month }) {
  // Extraer solo el mes del formato "yyyy-MM" si es necesario
  const monthNumber = month && typeof month === 'string' && month.includes('-')
    ? parseInt(month.split('-')[1])
    : parseInt(month);
    
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports-unit-account', unitId, month],
    queryFn: () => getUnitMovements(unitId, monthNumber),
    enabled: !!unitId,
  });

  const rows = data?.movements || [];

  const total = useMemo(() => data?.balance ?? 0, [data]);

  const handleExport = () => {
    if (!rows.length) return;
    const csvRows = rows.map((m) => ({ Fecha: m.date, Tipo: m.type, Descripción: m.description, Importe: m.amount }));
    exportToCsv(`estado_cuenta_${data.unit?.name || unitId}_${data.period?.month || month}.csv`, csvRows);
  };

  if (!unitId) return null;

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Estado de cuenta — {data?.unit?.name || unitId}</h5>
        <div>
          <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleExport} disabled={!rows.length}>Exportar CSV</button>
          <span className="small text-muted">Saldo: {total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
        </div>
      </div>

      {isLoading && <div> Cargando movimientos...</div>}
      {isError && <div className="text-danger">Error al cargar movimientos.</div>}

      {!isLoading && !isError && (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th className="text-end">Importe</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4}>Sin movimientos</td></tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.type}</td>
                    <td>{r.description}</td>
                    <td className="text-end">{r.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
