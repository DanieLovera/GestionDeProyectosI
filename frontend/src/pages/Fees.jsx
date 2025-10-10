import MenuLayout from "../components/MenuLayout";
import { useEffect, useMemo, useState } from "react";
import GenericTable from "../components/GenericTable";
import feesMock from "../mocks/fees";
import { getCommissionConfig, setCommissionConfig, getCommissionForMonth } from "../services/commission";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import { nPreviousMonths } from "../constants/config";
import GenericSelect from "../components/GenericSelect";

export default function Fees() {
  const [fees, setFees] = useState(feesMock);
  const [config, setConfig] = useState(() => getCommissionConfig());
  const months = getnPreviousMonth(nPreviousMonths);
  const [chosenMonth, setChosenMonth] = useState(months[0].value);

  const rows = useMemo(() => {
    // Keep existing mock table for historical entries
    return fees.map((f) => {
      const rate = Number(config.rate) || 0;
      const commission = Math.round(f.baseAmount * rate);
      return {
        id: f.id,
        description: f.description,
        baseAmount: f.baseAmount,
        commission,
        date: f.date,
      };
    });
  }, [fees, config]);

  // Live preview commission for selected month
  const previewCommission = useMemo(() => getCommissionForMonth(chosenMonth), [chosenMonth, config]);

  useEffect(() => {
    // Ensure config is persisted on mount (no-op if already saved)
    setCommissionConfig(config);
  }, []);

  const markPaid = (id) => setFees((prev) => prev.filter((f) => f.id !== id));

  return (
    <MenuLayout>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Comisiones</h3>
          <GenericSelect value={chosenMonth} setValue={setChosenMonth} options={months} />
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Configuración de comisión de administración</h5>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label">Tasa (%)</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  max={100}
                  step={0.1}
                  value={config.rate * 100}
                  onChange={(e) => setConfig((c) => ({ ...c, rate: Number(e.target.value) / 100 }))}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Base ($)</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  step={100}
                  value={config.base}
                  onChange={(e) => setConfig((c) => ({ ...c, base: Number(e.target.value) }))}
                />
              </div>
              <div className="col-12 col-md-4 d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => setCommissionConfig(config)}
                >
                  Guardar configuración
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setConfig(getCommissionConfig())}
                >
                  Restablecer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h6 className="mb-1">Previsualización para el mes seleccionado</h6>
          {previewCommission ? (
            <div className="alert alert-info mb-0">
              {previewCommission.description}: {previewCommission.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
            </div>
          ) : (
            <div className="alert alert-warning mb-0">Configura tasa y base para generar la comisión.</div>
          )}
        </div>

        {rows.length === 0 ? (
          <p>No hay comisiones registradas.</p>
        ) : (
          <GenericTable
            data={rows}
            columns={[
              { key: "description", label: "Descripción" },
              { key: "date", label: "Fecha" },
              {
                key: "baseAmount",
                label: "Base",
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              {
                key: "commission",
                label: "Comisión",
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              {
                key: "actions",
                label: "Acciones",
                formatFn: (_, row) => (
                  <button className="btn btn-sm btn-success" onClick={() => markPaid(row.id)}>Marcar como pagado</button>
                ),
              },
            ]}
            emptyMsg="No hay comisiones registradas."
          />
        )}
      </div>
    </MenuLayout>
  );
}
