import { Link } from "react-router-dom"

const PurpleLink = ({ node, children, ...props }) => {
  return (
    <Link {...props} className="text-primary-base hover:text-primary-light active:text-primary-dark">
      {children}
    </Link>
  )
}

export default PurpleLink
