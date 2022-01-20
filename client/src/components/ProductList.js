import { useLayoutEffect, useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Spinner from "./Spinner";
import Product from "./Product";

const ProductList = ({ showOnlyOrders }) => {
  const { products: queryProducts, userOwnedProducts } = useProducts();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setProducts(() => {
      let newProducts = showOnlyOrders ? userOwnedProducts : queryProducts;

      newProducts = newProducts?.filter((product) =>
        product.name.toLowerCase().trim().includes(search.toLowerCase().trim())
      );

      return newProducts;
    });
  }, [search, showOnlyOrders, queryProducts, userOwnedProducts]);

  return !products ? (
    <div className="center" style={{ height: "80vh" }}>
      <Spinner />
    </div>
  ) : (
    <div className="container">
      <form onSubmit={(e) => e.preventDefault()} className="my-3 d-flex">
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {currentUser.admin && (
          <Link to="/product/add">
            <button type="button" className="ms-2 btn btn-primary">
              Add
            </button>
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <div className="center" style={{ height: "60vh" }}>
          <p className="fs-2">No Products found!</p>
        </div>
      ) : (
        <div className="row align-items-start justify-content-md-between justify-content-lg-start justify-content-center">
          {products.map((product) => (
            <Product
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              userOwned={product.reservedBy?.find(
                (reserved) => reserved?.email === currentUser.email
              )}
              quantity={product.quantity}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
