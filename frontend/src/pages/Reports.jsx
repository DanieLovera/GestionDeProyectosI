import MenuLayout from "../components/MenuLayout";
import InfoCard from "../components/InfoCard";
import ReportCategoryChart from "../components/ReportCategoryChart";
import GenericTable from "../components/GenericTable";
import UnitMovementsModal from "../components/UnitMovementsModal";
import UnitAccountSection from "../components/UnitAccountSection";
import GenericSelect from "../components/GenericSelect";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getDashboard, getByUnit, getByCategory } from "../services/reports";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import { nPreviousMonths } from "../constants/config";
import { exportToCsv } from "../utils/exportToCsv";

export default function Reports() {
  const months = getnPreviousMonth(nPreviousMonths);
  const [chosenMonth, setChosenMonth] = useState(months[0].value);
  const [showMovements, setShowMovements] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Extraer solo el mes del formato "yyyy-MM" para los servicios que esperan número
  const monthNumber = useMemo(() => {
    if (typeof chosenMonth === 'string' && chosenMonth.includes('-')) {
      return parseInt(chosenMonth.split('-')[1]); // "2025-10" -> 10
    }
    return parseInt(chosenMonth);
  }, [chosenMonth]);

  const { data: dashboard } = useQuery({
    queryKey: ["reports-dashboard", chosenMonth],
    queryFn: () => getDashboard(monthNumber),
  });

  const { data: byUnit } = useQuery({
    queryKey: ["reports-by-unit", chosenMonth],
    queryFn: () => getByUnit(monthNumber),
  });

  const { data: byCategory } = useQuery({
    queryKey: ["reports-by-category", chosenMonth],
    queryFn: () => getByCategory(monthNumber),
  });

  const tableRows = useMemo(() => byUnit?.units || [], [byUnit]);

  const handleExport = () => {
    if (!tableRows.length) return;
    const rows = tableRows.map((u) => ({
      Unidad: u.name,
      Superficie: u.surface,
      Participacion: (u.participationPct * 100).toFixed(2) + "%",
      Monto: u.amount,
      Pagado: u.paid,
      Pendiente: u.pending,
      Mora: u.lateFee,
    }));
    exportToCsv(`reporte_unidades_${chosenMonth}.csv`, rows);
  };

  const openMovements = (row) => {
    setSelectedUnit({ id: row.id, name: row.name });
    setShowMovements(true);
  };
  const closeMovements = () => {
    setShowMovements(false);
    setSelectedUnit(null);
  };

  return (
    <MenuLayout>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Reportes</h3>
          <GenericSelect value={chosenMonth} setValue={setChosenMonth} options={months} />
        </div>

        <div className="d-flex gap-3 flex-wrap">
          <InfoCard title="Gastos comunes" info={dashboard?.totals?.commonExpenses || 0} formatFn={(v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} />
          <InfoCard title="Cobrado" info={dashboard?.totals?.collected || 0} formatFn={(v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} />
          <InfoCard title="Pendiente" info={dashboard?.totals?.overdue || 0} formatFn={(v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} />
          <InfoCard title="Mora" info={dashboard?.totals?.lateFees || 0} formatFn={(v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} />
        </div>

        <div className="my-3">
          <h5 className="mb-2">Gastos por categoría</h5>
          <ReportCategoryChart data={byCategory?.categories || []} />
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
          <h5 className="mb-0">Resumen por unidad</h5>
          <div className="d-flex gap-2 align-items-center">
            <select className="form-select form-select-sm" style={{ width: 220 }} value={selectedUnit?.id || ''} onChange={(e) => setSelectedUnit(byUnit?.units.find(u => u.id === e.target.value) || null)}>
              <option value="">Seleccionar unidad...</option>
              {byUnit?.units?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>Exportar CSV</button>
          </div>
        </div>
        <GenericTable
          data={tableRows}
          columns={[
            { key: "name", label: "Unidad" },
            { key: "surface", label: "Superficie (m²)" },
            { key: "participationPct", label: "%", formatFn: (v) => `${(v * 100).toFixed(2)}%` },
            { key: "amount", label: "Monto", formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) },
            { key: "paid", label: "Pagado", formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) },
            { key: "pending", label: "Pendiente", formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) },
            { key: "lateFee", label: "Mora", formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) },
            { key: "actions", label: "Acciones", formatFn: (_, row) => (
              <button className="btn btn-link p-0" onClick={() => openMovements(row)}>
                Ver movimientos
              </button>
            ) },
          ]}
          emptyMsg="Sin datos para el período seleccionado."
        />
        <UnitMovementsModal
          show={showMovements}
          onClose={closeMovements}
          unit={selectedUnit}
          month={chosenMonth}
        />
          <UnitAccountSection unitId={selectedUnit?.id} month={chosenMonth} />
      </div>
    </MenuLayout>
  );
}
