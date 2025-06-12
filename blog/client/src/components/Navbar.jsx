import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg flex justify-between items-center">
      <Link to="/" className="text-xl font-bold hover:text-blue-400 transition duration-300">
        My App
      </Link>
      <div>
        <Link to="/" className="mr-4 hover:text-blue-400 transition duration-300">
          Home
        </Link>
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} className="mr-4 hover:text-blue-400 transition duration-300">
              Profile
            </Link>
            <button
              onClick={logout}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition duration-300"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4 hover:text-blue-400 transition duration-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-400 transition duration-300">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
