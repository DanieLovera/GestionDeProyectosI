import { subMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalizeFirstLetter } from "./capitalizeFirstLetter";

const getnPreviousMonth = (n) => {
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
        const date = subMonths(now, i);
        return {
            label: capitalizeFirstLetter(format(date, "MMMM yyyy", { locale: es })),
            value: format(date, "MM"),
        };
    });
};

export { getnPreviousMonth };
