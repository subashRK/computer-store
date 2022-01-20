import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import Alert from "./Alert";

const Profile = () => {
  const [message, setMessage] = useState(null);

  const { currentUser, signout } = useAuth();
  const { userOwnedProducts } = useProducts();

  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const email = inputRef.current.value;
    inputRef.current.disabled = true;

    try {
      await axios.post(
        "/make-admin",
        { email },
        {
          headers: {
            authorization: currentUser.accessToken,
          },
        }
      );

      inputRef.current.disabled = false;
      inputRef.current.value = "";
      setMessage({
        type: "success",
        message: `Succesfully made ${email} as an admin!`,
      });
    } catch (e) {
      inputRef.current.disabled = false;
      setMessage({ type: "error", message: Object.values(e)[2]?.data?.error });
    }
  };

  return (
    <div className="center" style={{ marginTop: "7.5vh" }}>
      <div
        className="card border-0 shadow"
        style={{ width: 450, maxWidth: "90%" }}
      >
        <div className="card-body">
          <div className="d-flex d-column align-items-center">
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="d-inline profile-avatar"
            />

            <div className="ms-2">
              <span className="fs-5 card-title">{currentUser.displayName}</span>
              <span className="fs-6 d-block card-subtitle text-muted">
                {currentUser.email}
              </span>
            </div>
          </div>
          <hr />

          {message && (
            <Alert color={message.type === "error" ? "danger" : "success"}>
              {message.message}
            </Alert>
          )}

          <Link
            to="/product/orders"
            className="d-flex justify-content-between align-items-center profile-data shadow-sm m-2 p-3"
            style={{ cursor: "pointer" }}
          >
            <span>
              Pending Orders{" "}
              {userOwnedProducts && (
                <div className="badge bg-secondary rounded-pill">
                  {userOwnedProducts.length}
                </div>
              )}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
              />
            </svg>
          </Link>

          <Link
            to="/issues"
            className="d-flex justify-content-between align-items-center profile-data shadow-sm m-2 mt-3 p-3"
            style={{ cursor: "pointer" }}
          >
            <span>Your Issues</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
              />
            </svg>
          </Link>

          {currentUser.admin && (
            <form className="form-group m-2 mt-3" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                className="form-control"
                placeholder="Make admin"
                ref={inputRef}
              />
            </form>
          )}

          <hr />
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={async () => await signout()}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
