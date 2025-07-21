import {authentication,db} from "./fbconfig.js"
import{createUserWithEmailAndPassword,updateProfile} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
import{setDoc,doc} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

// document.addEventListener("DOMContentLoaded",()=>{

//     let signupform=document.getElementById("signupform")

//     signupform.addEventListener("submit",async(e)=>{
//       e.preventDefault()
//         let name=document.getElementById("name").value
//         let email=document.getElementById("email").value
//         let password=document.getElementById("password").value
//         let role=document.getElementById("role").value

//       const usercredential=await  createUserWithEmailAndPassword(authentication,email,password)
//       const userdetail=usercredential.user
//       console.log(userdetail)
//       await updateProfile(userdetail,{
//        displayName:name,
//       })

//       await setDoc(doc(db,`${role}s`,name),{
//         name,
//         email,
//         role
//       })

//       alert(`${role} created successfully`)
//       location.href="./login.html"

//     })
// })

document.addEventListener("DOMContentLoaded", () => {
  const signupform = document.getElementById("signupform");

  signupform.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password || !role) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Fields',
        text: 'Please fill in all fields.'
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(authentication, email, password);
      const userDetail = userCredential.user;

      await updateProfile(userDetail, {
        displayName: name
      });

      await setDoc(doc(db, `${role}s`, name), {
        name,
        email,
        role
      });

      Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: `${role} created successfully! Redirecting to login...`,
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        location.href = "./login.html";
      });

    } catch (error) {
      console.error("Signup error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: error.message || 'Something went wrong. Please try again.'
      });
    }
  });
});
