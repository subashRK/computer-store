import { collection, doc, onSnapshot, updateDoc } from "@firebase/firestore";
import moment from "moment";
import { useEffect, useState } from "react";
import { firestore } from "../firebase";
import AddComment from "./AddComment";
import Comment from "./Comment";

const Issue = ({
  id,
  user: { email, uid, displayName, image },
  issue,
  timestamp,
  closed,
}) => {
  const [comments, setComments] = useState();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, `issues/${id}/comments`),
      (snpashot) =>
        setComments(snpashot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    return unsubscribe;
  }, [id]);

  const closeIssue = async (e) => {
    if (closed) return;

    const buttonText = e.target.innerText;
    e.target.disabled = true;
    e.target.innerText = "Closing issue";

    try {
      await updateDoc(doc(firestore, `issues/${id}`), { closed: true });
      e.target.disabled = true;
      e.target.innerText = "Closed";
    } catch {
      e.target.disabled = false;
      e.target.innerText = buttonText;
      alert("Something went wrong!");
    }
  };

  return (
    <div className="card mb-3" style={{ width: "100%" }}>
      <div className="card-body">
        <div className="d-flex d-column align-items-center">
          <img
            src={image}
            alt="User Profile"
            className="d-inline profile-avatar"
          />

          <div className="ms-2">
            <span className="fs-5 card-title">{email}</span>
            <span className="fs-6 d-block card-subtitle text-muted">
              {displayName}
            </span>
          </div>
          <div className="badge bg-secondary ms-3 mt-2 align-self-start">
            {moment(timestamp.toDate()).fromNow()}
          </div>
        </div>
        <hr />

        <p className="card-text">{issue}</p>

        <hr />
        <AddComment id={id} userUid={uid} />

        {comments && comments.length !== 0 && (
          <div
            style={{ maxHeight: 100, overflowY: "scroll" }}
            className="d-flex flex-column mt-2"
          >
            {comments.map((comment) => (
              <Comment
                comment={comment.comment}
                admin={comment.admin}
                key={comment.id}
              />
            ))}
          </div>
        )}

        <hr />
        <button
          className={`btn btn-outline-danger w-100`}
          disabled={closed}
          onClick={closeIssue}
        >
          {!closed ? "Close Issue" : "Closed"}
        </button>
      </div>
    </div>
  );
};

export default Issue;
