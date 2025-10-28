import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 0",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{ width: "100%", padding: "0 2rem", boxSizing: "border-box" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#2563eb",
              textDecoration: "none",
            }}
          >
            BlogPlatform
          </Link>

          {/* Navigation Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link
              to="/"
              style={{
                color: "#6b7280",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create-post"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                >
                  Write
                </Link>

                <Link
                  to="/dashboard"
                  style={{
                    color: "#6b7280",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  Dashboard
                </Link>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      /* Toggle dropdown */
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "#6b7280",
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span style={{ color: "#6b7280" }}>{user?.username}</span>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    color: "#dc2626",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#fef2f2")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: "#6b7280",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
