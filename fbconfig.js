
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
  import{getAuth} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
  import{getFirestore} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
  const firebaseConfig = {
    apiKey: "AIzaSyC-1S3En2GhtWm8Qt8LGJ6GyqrFRKJeDiU",
    authDomain: "outfittery-f1ecd.firebaseapp.com",
    projectId: "outfittery-f1ecd",
    storageBucket: "outfittery-f1ecd.firebasestorage.app",
    messagingSenderId: "528663426637",
    appId: "1:528663426637:web:1ec22071c5c2c14f37ce04",
    measurementId: "G-YVF2TFV21W"
  };

  export const projectapp = initializeApp(firebaseConfig);
  export const authentication=getAuth(projectapp)
export const db=getFirestore(projectapp)
