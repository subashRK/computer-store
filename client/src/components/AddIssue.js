import { addDoc, collection } from "@firebase/firestore";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore, firestoreTimestamp } from "../firebase";
import Alert from "./Alert";

const AddIssue = () => {
  const [input, setInput] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [message, setMessage] = useState(null);

  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);
    setMessage(null);

    try {
      await addDoc(collection(firestore, "issues"), {
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          image: currentUser.photoURL,
        },
        timestamp: firestoreTimestamp(),
        issue: input,
      });

      setInput("");
      setDisabled(false);
      setMessage({ type: "success", message: "Succesfully added your issue!" });
    } catch {
      setDisabled(false);
      setMessage({ type: "error", message: "Something went wrong!" });
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Add
      </button>

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Add Issue
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={disabled}
              ></button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {message && (
                <div className="mb-3">
                  <Alert
                    color={message.type === "error" ? "danger" : "success"}
                  >
                    {message.message}
                  </Alert>
                </div>
              )}

              <textarea
                type="text"
                style={{ maxHeight: "60vh" }}
                placeholder="Describe your issue"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="form-control"
                disabled={disabled}
              />
            </form>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={disabled}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={disabled}
              >
                Add Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddIssue;
