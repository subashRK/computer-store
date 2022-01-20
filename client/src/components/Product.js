import axios from "../axios";
import { useAuth } from "../context/AuthContext";

const Product = ({ name, id, image, price, userOwned, quantity }) => {
  const { currentUser } = useAuth();

  const buyProduct = async (e) => {
    e.target.disabled = true;

    const orderQuantity = prompt("Quantity:");

    if (!orderQuantity || isNaN(orderQuantity)) {
      e.target.disabled = false;
      return alert("Please enter a valid number");
    }

    if (orderQuantity > quantity) {
      e.target.disabled = false;
      return alert(`There are just ${quantity} products left!`);
    }

    try {
      const res = await axios.post(
        "/product/order",
        { items: [{ id, quantity: parseInt(orderQuantity) }] },
        {
          headers: {
            authorization: currentUser.accessToken,
          },
        }
      );

      e.target.disabled = false;
      window.location.href = res.data.checkoutURL;
    } catch {
      e.target.disabled = false;
      alert("Something went wrong!");
    }
  };

  const cancelProduct = async (e) => {
    e.target.disabled = true;

    try {
      await axios.post(
        "/product/cancel",
        { item: id },
        {
          headers: {
            authorization: currentUser.accessToken,
          },
        }
      );

      e.target.disabled = false;
    } catch {
      e.target.disabled = false;
      alert("Something went wrong!");
    }
  };

  return (
    <div className="card p-0 m-3" style={{ width: "18rem" }} key={id}>
      {/* <img src={image} className="card-img-top" alt={name} /> */}
      <div className="card-body">
        <p className="fs-5 mb-3 card-title">{name}</p>

        {!quantity ? (
          <button className="btn btn-primary d-block" disabled={true}>
            Not Available
          </button>
        ) : (
          <button onClick={buyProduct} className="btn btn-primary">
            Buy Product Rs. {price}
          </button>
        )}
        {userOwned && (
          <button onClick={cancelProduct} className="btn btn-danger mt-1">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
