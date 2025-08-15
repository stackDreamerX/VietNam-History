import React from "react";
import TextEditor from "../../pages/AskQuestionPage/partials/TextEditor";
import LoadingComponent from "../LoadingComponent/LoadingComponent";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
const AnswerEditor = React.memo(
  ({
    content,
    onContentChange,
    onSubmit,
    onCancel,
    isLoading,
    imageSrcs,
    onImageUpload,
    onRemoveImage,
  }) => {
    return (
      <div>
        <div className="input" style={{ marginTop: "30px" }}>
          <h1 className="label">Upload Images</h1>
          <input type="file" multiple onChange={onImageUpload} />
          {imageSrcs.length > 0 && (
            <div>
              <h3>Preview Images</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {imageSrcs.map((src, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`Uploaded preview ${index}`}
                      style={{
                        width: "500px",
                        height: "auto",
                        margin: "10px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      style={{
                        // position: "absolute",
                        top: "0",
                        right: "0",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                      onClick={() => onRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="input" style={{ marginTop: "30px" }}>
          <h1 className="label">
            Answer details <span className="asterisk">*</span>
          </h1>

          <TextEditor
            value={content}
            onChange={onContentChange}
            placeholder="Write your answer here..."
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <LoadingComponent isLoading={isLoading}>
            <ButtonComponent textButton="Submit answer" onClick={onSubmit} />
          </LoadingComponent>
          <ButtonComponent
            textButton="Cancel"
            onClick={onCancel}
            style={{ marginLeft: "20px" }}
          />
        </div>
      </div>
    );
  }
);

export default AnswerEditor;
