import React, { useRef, useState, useCallback, createContext, useEffect } from 'react';
import app, { User } from 'firebase/app';
import 'firebase/auth';

import './App.scss';

import bannerImg from './assets/banner.png';
import LoginForm from './components/LoginForm';

const {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_DB_URI,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_MEASUREMENT_ID,
} = process.env;

const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: REACT_APP_FIREBASE_DB_URI,
  projectId: REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID,
  measurementId: REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
app.initializeApp(firebaseConfig);

const UserContext = createContext<User | undefined>(undefined);

function useAuth(): [
  User | undefined,
  (email: string, password: string) => Promise<void>,
  () => Promise<void>
] {
  const auth = useRef(app.auth());

  const [currentUser, setCurrentUser] = useState<User>();

  auth.current.onAuthStateChanged(function (user) {
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(undefined);
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    await auth.current.signInWithEmailAndPassword(email, password);
  }, []);

  const logout = useCallback(async () => {
    await auth.current.signOut();
  }, []);

  return [currentUser, login, logout];
}

function App() {
  const [currentUser, login, logout] = useAuth();

  return (
    <UserContext.Provider value={currentUser}>
      <div className="App">
        <header data-testid="app-header">
          <div>
            <h1>Niels Van den Broeck</h1>
            <p>Fullstack Javascript developer</p>
          </div>
          <div>
            {currentUser ? (
              <>
                <span>Welkom {currentUser.displayName}</span>
                <button type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <LoginForm onSubmit={login} />
            )}
          </div>
        </header>
        <main className="App">
          <div className="banner">
            <img src={bannerImg} alt="laptop" />
          </div>
          <div>
            <p></p>
          </div>
        </main>
      </div>
    </UserContext.Provider>
  );
}

export default App;
