const Alert = ({ color, children }) => {
  return (
    <div className={`alert alert-${color} p-2 my-2`} role="alert">
      {children}
    </div>
  )
}

export default Alert
