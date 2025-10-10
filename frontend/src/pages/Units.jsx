import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import UnitForm from "../components/UnitForm";
import { addUnit, deleteUnit, getUnits, updateUnit } from "../services/units";

export default function Units() {
  const qc = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["units"], queryFn: getUnits });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const addMut = useMutation({
    mutationFn: addUnit,
    onSuccess: () => qc.invalidateQueries(["units"]),
  });
  const updMut = useMutation({
    mutationFn: ({ id, payload }) => updateUnit(id, payload),
    onSuccess: () => qc.invalidateQueries(["units"]),
  });
  const delMut = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => qc.invalidateQueries(["units"]),
  });

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setShowForm(true);
  };
  const onSave = async (payload) => {
    if (editing) {
      await updMut.mutateAsync({ id: editing.id, payload });
    } else {
      await addMut.mutateAsync(payload);
    }
    setShowForm(false);
  };

  return (
    <MenuLayout>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Unidades</h3>
          <button className="btn btn-primary" onClick={openCreate}>Nueva unidad</button>
        </div>

        {isLoading && <p>Cargando unidades...</p>}
        {isError && <p>Error al cargar las unidades.</p>}
        {!isLoading && !isError && (
          <GenericTable
            data={data}
            columns={[
              { key: "name", label: "Nombre" },
              { key: "surface", label: "Superficie (m²)" },
              { key: "owner", label: "Propietario" },
              {
                key: "participation",
                label: "% participación",
                formatFn: (_, row) => {
                  const total = data.reduce((s, u) => s + (u.surface || 0), 0);
                  const pct = total > 0 ? (row.surface / total) * 100 : 0;
                  return pct.toFixed(2) + "%";
                },
              },
              {
                key: "actions",
                label: "Acciones",
                formatFn: (_, row) => (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(row)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => delMut.mutate(row.id)}>Eliminar</button>
                  </div>
                ),
              },
            ]}
            emptyMsg="No hay unidades registradas."
          />
        )}
      </div>

      <UnitForm show={showForm} onClose={() => setShowForm(false)} onSave={onSave} initial={editing} />
    </MenuLayout>
  );
}
