import { addDoc, collection } from "@firebase/firestore";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore } from "../firebase";

const AddComment = ({ id, userUid }) => {
  const [comment, setComment] = useState("");
  const [disabled, setDisabled] = useState(false);

  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);

    try {
      await addDoc(collection(firestore, `issues/${id}/comments`), {
        comment,
        admin: currentUser.uid !== userUid,
      });

      setDisabled(false);
      setComment("");
    } catch {
      setDisabled(false);
      alert("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-group">
      <input
        type="text"
        placeholder="Add comment..."
        className="form-control"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={disabled}
        required
      />
      <button
        type="submit"
        className="btn btn-outline-primary"
        disabled={disabled}
      >
        Add
      </button>
    </form>
  );
};

export default AddComment;
