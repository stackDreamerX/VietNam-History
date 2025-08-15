import React, { useState } from "react";

const ButtonComponent = (props) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      type={props.type || "button"}
      className="btn btn-primary"
      style={{
        fontSize: "16px",
        border: "none",
        backgroundColor: hover ? "#EDBE00" : "#EDBE00",
        color: "#000000",
        ...props.style,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={props.onClick}
    >
      <span>{props.textButton}</span>
      {props.icon && (
        <span style={{ fontSize: "20px", marginLeft: "8px" }}>
          {props.icon}
        </span>
      )}
    </button>
  );
};

export default ButtonComponent;
