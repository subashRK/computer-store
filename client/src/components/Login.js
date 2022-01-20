import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Spinner from "./Spinner"
import Alert from "./Alert"

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { signInWithGoogle } = useAuth()

  const handleClick = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="center" style={{ height: "100vh" }}>
      {loading ? <Spinner /> : (
        <>
          {error && <div style={{
            position: "absolute",
            top: 0,
            width: "90%"
          }}><Alert color="danger">{error}</Alert></div>}
          <button className="btn btn-danger" onClick={handleClick}>Sign In via Google</button>
        </>
      )}
    </div>
  )
}

export default Login
