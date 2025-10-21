import Form from "react-bootstrap/Form";

function GenericSelect({
    value,
    setValue,
    options = [],
    className = "",
    label = "",
    errorMessage = "",
    required = false,
    emptyOptionLabel = "-- ninguno --",
    showEmptyOption = false,
}) {
    const handleChange = (e) => {
        setValue(e.target.value);
    };

    return (
        <Form.Group className="mb-3">
            {label && (
                <Form.Label htmlFor="generic-select">
                    {label} {required && <span className="text-danger">*</span>}
                </Form.Label>
            )}
            <Form.Select
                id="generic-select"
                className={`${className} ${errorMessage ? "is-invalid" : ""}`}
                value={value || ""}
                onChange={handleChange}
            >
                {showEmptyOption && <option value="">{emptyOptionLabel}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errorMessage}</Form.Control.Feedback>
        </Form.Group>
    );
}

export default GenericSelect;
