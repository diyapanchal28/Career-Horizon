import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-context";

const API_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [savedCareers, setSavedCareers] = useState([]);
  const [savedCareerIds, setSavedCareerIds] = useState(new Set());
  const [loadingSaved, setLoadingSaved] = useState(false);

  const isAuthenticated = Boolean(token && user);

  // Logout handler declared first
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setSavedCareers([]);
    setSavedCareerIds(new Set());
  }, []);

  // Fetch saved careers callback
  const fetchSavedCareers = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setSavedCareers([]);
      setSavedCareerIds(new Set());
      return;
    }

    try {
      setLoadingSaved(true);
      const res = await fetch(`${API_URL}/saved-careers`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
        }
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.savedCareers || data.data || [];
      setSavedCareers(list);

      const idSet = new Set();
      list.forEach((item) => {
        const id = item.career?._id || item.career?.id || item.career || item.careerId;
        if (id) idSet.add(String(id));
      });
      setSavedCareerIds(idSet);
    } catch (err) {
      console.error("Error fetching saved careers:", err);
    } finally {
      setLoadingSaved(false);
    }
  }, [token, logout]);

  // Refresh user profile from backend
  const refreshUser = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) return null;

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        return null;
      }
      const data = await res.json();
      const userObj = data.user || data;
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      return userObj;
    } catch (err) {
      console.error("Error refreshing user profile:", err);
      return null;
    }
  }, [token, logout]);

  // Direct update user helper
  const updateUser = useCallback((newUserData) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...newUserData };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!token) {
        setSavedCareers([]);
        setSavedCareerIds(new Set());
        return;
      }
      try {
        setLoadingSaved(true);
        const [savedRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/saved-careers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (savedRes.status === 401 || profileRes.status === 401) {
          logout();
          return;
        }

        if (profileRes.ok && !ignore) {
          const pData = await profileRes.json();
          const uObj = pData.user || pData;
          localStorage.setItem("user", JSON.stringify(uObj));
          setUser(uObj);
        }

        if (savedRes.ok && !ignore) {
          const data = await savedRes.json();
          const list = Array.isArray(data) ? data : data.savedCareers || data.data || [];
          setSavedCareers(list);
          const idSet = new Set();
          list.forEach((item) => {
            const id = item.career?._id || item.career?.id || item.career || item.careerId;
            if (id) idSet.add(String(id));
          });
          setSavedCareerIds(idSet);
        }
      } catch (err) {
        console.error("Error loading user session data:", err);
      } finally {
        if (!ignore) setLoadingSaved(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token, logout]);

  // Login handler
  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    fetchSavedCareers(newToken);
    refreshUser(newToken);
  };

  // Check if a career is saved
  const isCareerSaved = (careerId) => {
    if (!careerId) return false;
    return savedCareerIds.has(String(careerId));
  };

  // Toggle save career (save or remove)
  const toggleSaveCareer = async (careerId) => {
    if (!token) {
      return { success: false, requireAuth: true };
    }

    const idStr = String(careerId);
    const currentlySaved = savedCareerIds.has(idStr);

    try {
      if (currentlySaved) {
        // Remove career
        const res = await fetch(`${API_URL}/saved-careers/${careerId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to remove career");
        }

        // Optimistic update
        setSavedCareerIds((prev) => {
          const next = new Set(prev);
          next.delete(idStr);
          return next;
        });
        setSavedCareers((prev) =>
          prev.filter((item) => {
            const itemCareerId =
              item.career?._id || item.career?.id || item.career || item.careerId;
            return String(itemCareerId) !== idStr;
          })
        );

        return { success: true, saved: false, message: "Removed from saved careers" };
      } else {
        // Save career
        const res = await fetch(`${API_URL}/saved-careers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ career: careerId }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to save career");
        }

        // Optimistic update
        setSavedCareerIds((prev) => {
          const next = new Set(prev);
          next.add(idStr);
          return next;
        });

        // Refresh list to get populated object
        fetchSavedCareers(token);

        return { success: true, saved: true, message: "Career saved successfully!" };
      }
    } catch (err) {
      console.error("Error toggling saved career:", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        savedCareers,
        savedCareerIds,
        loadingSaved,
        login,
        logout,
        refreshUser,
        updateUser,
        isCareerSaved,
        toggleSaveCareer,
        refreshSavedCareers: () => fetchSavedCareers(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
