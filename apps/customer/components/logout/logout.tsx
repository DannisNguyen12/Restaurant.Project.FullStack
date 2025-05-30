import React from "react";

const Logout: React.FC = () => {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    // Reload the page to reflect logout
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      style={{ marginRight: 16 }}
    >
      Logout
    </button>
  );
};

export default Logout;
