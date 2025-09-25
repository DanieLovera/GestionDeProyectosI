import Table from "react-bootstrap/Table";

function CommonExpensesTable({ expenses = [], emptyMsg = "" }) {
    return (
        <Table striped bordered hover responsive>
            <thead className="table-dark">
                <tr>
                    <th>#</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                {expenses.length > 0 ? (
                    expenses.map((g, index) => (
                        <tr key={g.id}>
                            <td>{index + 1}</td>
                            <td>{g.concepto}</td>
                            <td>${g.monto.toLocaleString()}</td>
                            <td>{g.fecha}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="text-center">
                            {emptyMsg}
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
}

export default CommonExpensesTable;
