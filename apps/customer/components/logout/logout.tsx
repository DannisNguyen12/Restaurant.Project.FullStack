import React from "react";

const Logout: React.FC = () => {
  const handleLogout = async () => {
    // Call the logout API to clear session and cart cookies
    await fetch("/api/logout", { method: "POST" });
    
    // Also clear cart from localStorage if it exists (for redundancy)
    try {
      document.cookie = "cart=;path=/;max-age=0";
    } catch (e) {
      console.error("Failed to clear cart cookie:", e);
    }
    
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
