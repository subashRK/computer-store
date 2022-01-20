import "./App.css";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import { useAuth } from "./context/AuthContext";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Profile from "./components/Profile";
import { ProductsProvider } from "./context/ProductsContext";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import IssueList from "./components/IssueList";

const App = () => {
  const { loading, currentUser } = useAuth();

  return (
    <div>
      {loading ? (
        <div className="center" style={{ height: "100vh" }}>
          <Spinner />
        </div>
      ) : currentUser ? (
        <Router>
          <ProductsProvider>
            <Navbar />

            <Route path="/" exact>
              <ProductList />
            </Route>

            <Route path="/profile" exact>
              <Profile />
            </Route>

            <Route path="/product/add" exact>
              <AddProduct />
            </Route>

            <Route path="/product/orders" exact>
              <ProductList showOnlyOrders />
            </Route>

            <Route path="/issues" exact>
              <IssueList />
            </Route>
          </ProductsProvider>
        </Router>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
