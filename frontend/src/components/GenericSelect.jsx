import Form from "react-bootstrap/Form";

function GenericSelect({ value, setValue, options = [], className }) {
    return (
        <Form.Select id="generic-select" className={className} value={value} onChange={(e) => setValue(e.target.value)}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Form.Select>
    );
}

export default GenericSelect;
