import Form from "react-bootstrap/Form";

function CommonExpensesFilter({ chosenMonth, setChosenMonth, months }) {
    return (
        <Form.Select
            id="month-select"
            className="mb-3"
            value={chosenMonth}
            onChange={(e) => setChosenMonth(e.target.value)}
        >
            {months.map((m) => (
                <option key={m.value} value={m.value}>
                    {m.label}
                </option>
            ))}
        </Form.Select>
    );
}

export default CommonExpensesFilter;
