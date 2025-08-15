import React from 'react';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import './ModalComponent.css';

const ModalComponent = (props) => {
    if (!props.isOpen) return null; // Không hiển thị nếu isOpen là false

    return (
        <div className="custom-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{props.title}</h5>
                    <div style={{marginBottom:'5px'}}>
                    <ButtonComponent  
                    icon={<i className="bi bi-x"></i>}
                    onClick={props.onClick2}/>
                    </div>
                </div>
                <div className="modal-body">
                    {props.body}
                </div>
                <div className="modal-footer">
                    <ButtonComponent 
                    textButton={props.textButton1}
                    onClick={props.onClick1}/>
                </div>
            </div>
        </div>
    );
};

export default ModalComponent;