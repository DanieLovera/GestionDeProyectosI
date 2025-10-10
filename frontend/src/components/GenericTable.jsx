import Table from "react-bootstrap/Table";

function GenericTable({ data = [], columns = [], emptyMsg = "" }) {
    const header = columns.map((col) => <th key={col.key}>{col.label}</th>);
    const body = data.map((row) => (
        <tr key={row.id}>
            {columns.map((col) => {
                const rowData = row[col.key];
                return <td key={col.key}>{col.formatFn ? col.formatFn(rowData, row) : rowData}</td>;
            })}
        </tr>
    ));

    const emptyBody = () => (
        <tr>
            <td colSpan={columns.length} className="text-center">
                {emptyMsg}
            </td>
        </tr>
    );

    return (
        <Table striped bordered hover responsive>
            <thead className="table-dark">
                <tr>{header}</tr>
            </thead>
            <tbody>{body.length > 0 ? body : emptyBody()}</tbody>
        </Table>
    );
}

export default GenericTable;
