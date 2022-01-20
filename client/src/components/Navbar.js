import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { signout } = useAuth()

  const handleClick = async () => await signout()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">Kadiakalsivam</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/profile">Profile</NavLink>
            </li>
            <li className="nav-item">
              <button className="nav-link nav-link-button" onClick={handleClick}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
