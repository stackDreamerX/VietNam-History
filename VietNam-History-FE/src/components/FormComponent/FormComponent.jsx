import React from "react";

const FormComponent = ({
  onChange = () => {},
  value = "",
  name = "",
  placeholder = "",
  ...props
}) => {
  // const handleOnChangeInput = (e) => {
  //   props.onChange(e); // Truyền toàn bộ event thay vì chỉ value
  // };

  return (
    <div style={{ marginBottom: "10px" }}>
      <label
        className="form-label"
        style={{ display: "block", marginBottom: "5px", fontSize: "16px" }}
      >
        {props.label}
      </label>
      <input
        id={props.id || name}
        name={name}
        value={value}
        placeholder={placeholder}
        type={props.type || "text"}
        style={{
          padding: "0 20px",
          backgroundColor: "#FFFFFF",
          fontSize: "16px",
          width: "100%",
          height: "35px",
          border: "1px solid #EDBE00",
          borderRadius: "10px",
        }}
        onChange={(e) => onChange(e)}
        {...props}
      />
    </div>
  );
};

export default FormComponent;
