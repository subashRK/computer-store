const Comment = ({ comment, admin }) => {
  return (
    <div className={admin ? "align-self-end me-2" : "align-self-start ms-2"}>
      <div className="d-flex">
        <span className="fw-bold me-1">{admin ? "Admin" : "You"}:</span>
        <p className="fs-6 mt-0">{comment}</p>
      </div>
    </div>
  );
};

export default Comment;
