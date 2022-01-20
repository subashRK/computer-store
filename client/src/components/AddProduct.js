import { useRef, useState } from "react";
import { Redirect } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import Alert from "./Alert";
import Spinner from "./Spinner";

const AddProduct = () => {
  const { currentUser } = useAuth();
  const { addProduct } = useProducts();

  const nameInputRef = useRef();
  const priceInputRef = useRef();
  const quantityInputRef = useRef();

  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile.type.includes("image")) {
      e.target.value = "";
      return setMessage({
        type: "error",
        message: "Please select a valid image!",
      });
    }

    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDisabled(true);

    const uploadCallbacks = {
      progress(snapshot) {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      error(e) {
        setMessage({ type: "error", message: e.message });
        setProgress(0);
        setDisabled(false);
      },
      complete() {
        nameInputRef.current.value = "";
        priceInputRef.current.value = "";
        quantityInputRef.current.value = "";

        setProgress(0);
        setFile(null);
        setMessage({
          type: "success",
          message: "Succesfully added this product!",
        });
        setDisabled(false);
      },
    };

    addProduct(
      {
        file,
        name: nameInputRef.current.value,
        price: priceInputRef.current.value,
        quantity: quantityInputRef,
      },
      uploadCallbacks
    );
  };

  return currentUser.admin ? (
    <div className="center" style={{ height: "80vh" }}>
      <form
        onSubmit={handleSubmit}
        className="form-group p-3 shadow-sm"
        style={{ width: 450, maxWidth: "90%" }}
      >
        <legend>Add Product</legend>
        <hr />
        {message && (
          <div className="mb-3">
            <Alert color={message.type === "error" ? "danger" : "success"}>
              {message.message}
            </Alert>
          </div>
        )}
        <input
          disabled={disabled}
          type="file"
          className="form-control mb-3"
          onChange={handleFileChange}
          file={file}
          required
        />
        <div className="progress mb-3">
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: progress }}
          ></div>
        </div>
        <input
          ref={nameInputRef}
          type="text"
          placeholder="Name"
          className="form-control mb-3"
          disabled={disabled}
          required
        />
        <input
          ref={priceInputRef}
          type="number"
          placeholder="Price in Rs."
          className="form-control mb-3"
          required
          disabled={disabled}
        />
        <input
          ref={quantityInputRef}
          type="number"
          placeholder="Quantity"
          className="form-control mb-3"
          required
          disabled={disabled}
        />
        <hr />
        <button
          className="btn btn-primary w-100"
          style={
            disabled
              ? { backgroundColor: "lightgrey", border: "lightgrey" }
              : {}
          }
          disabled={disabled}
        >
          {disabled ? <Spinner /> : "Add Product"}
        </button>
      </form>
    </div>
  ) : (
    <Redirect to="/" />
  );
};

export default AddProduct;
