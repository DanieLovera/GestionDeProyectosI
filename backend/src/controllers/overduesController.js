import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const getOverdueConfig = async (req, res) => {
  try {
    const db = req.tenantDb;
    const config = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (!config) {
      // Default coherente con frontend (0.104% diario)
      return res.json({ rate: 0.00104, startDay: 0, mode: "simple" });
    }

    res.json(config);
  } catch (err) {
    console.error("Error al obtener configuración de moras:", err);
    res.status(500).json({ message: "Error al obtener configuración", error: err.message });
  }
};

export const updateOverdueConfig = async (req, res) => {
  const { rate, startDay, mode = "simple" } = req.body;

  if (rate == null || startDay == null) {
    return res.status(400).json({ message: "rate y startDay son requeridos" });
  }

  try {
    const db = req.tenantDb;
    const existing = await db.get("SELECT * FROM overdues_config LIMIT 1");

    if (existing) {
      await db.run("UPDATE overdues_config SET rate = ?, startDay = ?, mode = ? WHERE id = ?",
        [rate, startDay, mode, existing.id]);
    } else {
      await db.run("INSERT INTO overdues_config (rate, startDay, mode) VALUES (?, ?, ?)",
        [rate, startDay, mode]);
    }

    res.json({ rate, startDay, mode });
  } catch (err) {
    console.error("Error al actualizar configuración de moras:", err);
    res.status(500).json({ message: "Error al actualizar configuración", error: err.message });
  }
};

// nuevo: listar moras calculadas en tiempo real basadas en deudas pendientes
export const getOverdues = async (req, res) => {
  try {
    const db = req.tenantDb;
    
    // Obtener configuración de moras
    const config = await db.get("SELECT * FROM overdues_config LIMIT 1") || { rate: 0.00104, startDay: 0 };
    
    // Obtener todas las unidades
    const units = await db.all("SELECT * FROM units");
    
    // Obtener todos los gastos comunes
    const commonExpenses = await db.all("SELECT * FROM common_expenses");
    const totalCommon = commonExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalSurface = units.reduce((sum, u) => sum + (u.surface || 0), 0);
    
    const overdues = [];
    const today = new Date();
    
    for (const unit of units) {
      // Calcular gasto común proporcional
      const commonShare = totalSurface > 0 ? (totalCommon * unit.surface) / totalSurface : 0;
      
      // Gastos individuales
      const individualExpenses = await db.all(
        "SELECT * FROM individual_expenses WHERE unit_id = ?",
        [unit.id]
      );
      const totalIndividual = individualExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      // Pagos realizados
      const payments = await db.all(
        "SELECT * FROM payments WHERE unit_id = ?",
        [unit.id]
      );
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Calcular deuda
      const totalDue = commonShare + totalIndividual;
      const pending = totalDue - totalPaid;
      
      // Si hay deuda pendiente, calcular mora
      if (pending > 0) {
        // Calcular días de atraso (asumiendo vencimiento a fin de mes anterior)
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const dueDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) - config.startDay);
        
        if (daysOverdue > 0) {
          const interestAmount = pending * config.rate * daysOverdue;
          
          overdues.push({
            id: unit.id,
            unitId: unit.id,
            unit: unit.name,
            dueDate: dueDate.toISOString().split('T')[0],
            originalAmount: pending,
            daysOverdue,
            interestAmount,
            totalAmount: pending + interestAmount
          });
        }
      }
    }
    
    res.json(overdues);
  } catch (err) {
    console.error("Error al obtener moras:", err);
    res.status(500).json({ message: "Error al obtener moras", error: err.message });
  }
};
