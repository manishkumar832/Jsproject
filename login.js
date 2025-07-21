import{authentication,db} from "./fbconfig.js"
import{signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
import{doc,getDoc} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

// document.addEventListener("DOMContentLoaded",()=>{
//     let Loginform=document.getElementById("loginform")

//     Loginform.addEventListener("submit",async(e)=>{
//       e.preventDefault()
//       let email=document.getElementById("email").value
//       let password=document.getElementById("password").value
//       let role=document.getElementById("role").value
      
//     const usersignedIn= await signInWithEmailAndPassword(authentication,email,password)
//     const nameSeller=usersignedIn.user.displayName
//     const UserRef=doc(db,`${role}s`,usersignedIn.user.displayName)
//     const FinalDoc=await getDoc(UserRef)
//     if(FinalDoc.exists()){
//        alert(`${role} is logged in`)
//        location.href=`${role}dashboard.html`
//        localStorage.setItem("sellerCredentials",JSON.stringify({email,role,nameSeller}))
//     }
    
//     })
// })
document.addEventListener("DOMContentLoaded", () => {
  const Loginform = document.getElementById("loginform");

  Loginform.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!email || !password || !role) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all fields.'
      });
      return;
    }

    try {
      const usersignedIn = await signInWithEmailAndPassword(authentication, email, password);
      const nameSeller = usersignedIn.user.displayName;

      const UserRef = doc(db, `${role}s`, nameSeller);
      const FinalDoc = await getDoc(UserRef);

      if (FinalDoc.exists()) {
        Swal.fire({
          icon: 'success',
          title: `${role} Logged In`,
          text: `Welcome, ${nameSeller}!`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          localStorage.setItem("sellerCredentials", JSON.stringify({ email, role, nameSeller }));
          location.href = `${role}dashboard.html`;
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: `No ${role} profile found for this user.`
        });
      }
    } catch (error) {
      console.error("Login failed", error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'An error occurred. Please try again.'
      });
    }
  });
});
