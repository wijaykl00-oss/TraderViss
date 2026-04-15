import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import InfoPage from './InfoPage';
import TestimonialPage from './TestimonialPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Set user immediately so UI routes to dashboard instantly without waiting for Firestore
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Run Firestore init asynchronously in the background
        const initFirestoreRecord = async () => {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email || `${currentUser.displayName || 'user'}@tradev.app`,
                displayName: currentUser.displayName || currentUser.email?.split('@')[0] || "Trader",
                photoURL: currentUser.photoURL,
                balance: 0, 
                hasClaimedBonus: false,
                totalDeposited: 0,
                createdAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error("Error setting up user in Firestore:", error);
          }
        };
        
        initFirestoreRecord();
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/dashboard/*" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
