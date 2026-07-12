import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Optimistic update for hardcoded admin
        if (firebaseUser.uid === 'r8XlrUMyZiSpojvMIz9TB1BiiCZ2') {
          setUserData({ role: 'Admin' });
        }
        
        // Unblock UI immediately so refresh doesn't hang
        setLoading(false);
        
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (firebaseUser.uid === 'r8XlrUMyZiSpojvMIz9TB1BiiCZ2') data.role = 'Admin';
            setUserData(data);
          } else {
            if (firebaseUser.uid !== 'r8XlrUMyZiSpojvMIz9TB1BiiCZ2') {
              console.warn("No user data found in Firestore for this auth user.");
              setUserData(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
