import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA4f_989jivOJYTh6LA9qscclvbgZUDyac",
  authDomain: "asdf-sd-0i09859.firebaseapp.com",
  projectId: "asdf-sd-0i09859",
  storageBucket: "asdf-sd-0i09859.appspot.com",
  messagingSenderId: "357765308046",
  appId: "1:357765308046:web:0fafdbd3c96361a226f3df",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

const firestoreTimestamp = serverTimestamp;

export { auth, firestore, storage, firestoreTimestamp };
