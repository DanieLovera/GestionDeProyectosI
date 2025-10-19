import MenuLayout from "../components/MenuLayout";
import { useEffect, useMemo, useState } from "react";
import GenericTable from "../components/GenericTable";
import { getCommissions, markCommissionPaid, getCommissionConfig, setCommissionConfig, getCommissionForMonth } from "../services/commission";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import { nPreviousMonths } from "../constants/config";
import GenericSelect from "../components/GenericSelect";

export default function Fees() {
  const [fees, setFees] = useState([]); // ahora vienen de la BD
  const [config, setConfig] = useState({ rate: 0, base: 0 });
  const [loading, setLoading] = useState(true);
  const months = getnPreviousMonth(nPreviousMonths);
  const [chosenMonth, setChosenMonth] = useState(months[0].value);

  // Cargar configuración inicial desde el backend
  useEffect(() => {
    (async () => {
      try {
        const data = await getCommissionConfig();
        setConfig(data);
      } catch (err) {
        console.error("Error al cargar config:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cargar comisiones desde BD
  const loadCommissions = async () => {
    try {
      setLoading(true);
      const items = await getCommissions();
      // normalizar al formato esperado por la UI (baseAmount/commission/date/description/id)
      const normalized = (items || []).map((it) => ({
        id: it.id,
        description: it.description,
        baseAmount: it.baseAmount ?? 0, // si no existe, conservar 0
        commission: it.amount ?? 0,
        date: it.date,
      }));
      setFees(normalized);
    } catch (err) {
      console.error("Error cargando comisiones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    // fees ya contienen commission (vienen de DB) o fall back a cálculo local
    const rate = Number(config.rate) || 0;
    return fees.map((f) => {
      const commission = Number(f.commission) || Math.round((f.baseAmount || 0) * rate);
      return {
        id: f.id,
        description: f.description,
        baseAmount: f.baseAmount || 0,
        commission,
        date: f.date,
      };
    });
  }, [fees, config]);

  const previewCommission = useMemo(
    () => getCommissionForMonth(chosenMonth, config),
    [chosenMonth, config]
  );

  const markPaid = async (id) => {
    try {
      await markCommissionPaid(id);
      // refrescar lista desde backend
      await loadCommissions();
      alert("Comisión marcada como pagada ✅");
    } catch (err) {
      console.error("Error marcando comisión como pagada:", err);
      alert("Error al marcar como pagado");
    }
  };

  const handleSave = async () => {
    try {
      const updated = await setCommissionConfig(config);
      setConfig(updated);
      alert("Configuración guardada correctamente ✅");
    } catch (err) {
      console.error("Error guardando config:", err);
      alert("Error al guardar configuración.");
    }
  };

  if (loading) {
    return (
      <MenuLayout>
        <div className="p-3">
          <p>Cargando configuración de comisión...</p>
        </div>
      </MenuLayout>
    );
  }

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
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, rate: Number(e.target.value) / 100 }))
                  }
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
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, base: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="col-12 col-md-4 d-flex gap-2">
                <button className="btn btn-primary" onClick={handleSave}>
                  Guardar configuración
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h6 className="mb-1">Previsualización para el mes seleccionado</h6>
          {previewCommission ? (
            <div className="alert alert-info mb-0">
              {previewCommission.description}:{" "}
              {previewCommission.amount.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </div>
          ) : (
            <div className="alert alert-warning mb-0">
              Configura tasa y base para generar la comisión.
            </div>
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
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              {
                key: "commission",
                label: "Comisión",
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              {
                key: "actions",
                label: "Acciones",
                formatFn: (_, row) => (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => markPaid(row.id)}
                  >
                    Marcar como pagado
                  </button>
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
