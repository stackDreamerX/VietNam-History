import React, { useState } from "react";
import "./DropdownComponent.css";

const DropdownComponent = ({ children, className = " ", ...props }) => {
  const [selectedItem, setSelectedItem] = useState("");
  return (
    <div class="dropdown">
      <button
        class="btn btn-lg dropdown-toggle d-flex border text-center"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        {...props}
      >
        {selectedItem || children}
      </button>
      <ul class="dropdown-menu">
        <li>
          <a class="dropdown-item" href="#">
            Action
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="#">
            Another action
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="#">
            Something else here
          </a>
        </li>
      </ul>
    </div>
  );
};

export default DropdownComponent;
