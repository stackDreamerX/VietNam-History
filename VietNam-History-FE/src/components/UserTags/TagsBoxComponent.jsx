import React from 'react';
import './TagsBoxComponent.css';

const TagsBoxComponent = ({ tagsname, description, quantity }) => {
  return (
    <div className="tags-box">
      <div className="row">
        <div className="tagsname">
          {tagsname}
        </div>
        <div className="description">
          {description}
        </div>
        <div className="quantity">

          {quantity}  questions

         
        </div>
      </div>
    </div>

  );
};

export default TagsBoxComponent;
