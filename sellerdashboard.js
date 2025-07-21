import {doc,updateDoc,arrayUnion,getDoc} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
import {signOut} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
import { db,authentication } from "./fbconfig.js"

document.addEventListener("DOMContentLoaded",()=>{

 let logginname=JSON.parse(localStorage.getItem("sellerCredentials"))
 let productContainer=document.getElementById("productContainer")
 if (!logginname) {
    alert("Please login to continue.");
    location.href = "mainpage.html";
    return;
  }

  const logoutbtn = document.getElementById("logout");

logoutbtn.addEventListener("click", async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out of your session.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      await signOut(authentication);
      localStorage.removeItem("sellerCredentials");
      localStorage.removeItem("productlist");
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        location.href = "mainpage.html";
      });
    } catch (error) {
      console.error("Logout failed", error);
      Swal.fire({
        title: 'Error!',
        text: 'Logout failed. Please try again.',
        icon: 'error'
      });
    }
  }
});



 console.log(logginname)
 let Aboutdetail=document.getElementById("toggleBtn")
 let aboutcontainer=document.getElementById("aboutcontainer")
 let isvisible=false
 Aboutdetail.addEventListener("click",()=>{
  productContainer.innerHTML=""
  if(isvisible){
    aboutcontainer.style.display="none"
  }else{
    if(logginname){
    aboutcontainer.innerHTML=`
     <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" width=200 id="profilelogo">
    <p><strong>Name:</strong>${logginname.nameSeller}</p>
    <p><strong>Email:</strong>${logginname.email}</p>
    <p><strong>Role:</strong>${logginname.role}</p>
    `
    aboutcontainer.style.display="block"
    }
   }
   isvisible=!isvisible
 })

 let addproduct=document.getElementById("addproduct")
 addproduct.addEventListener("click",()=>{
  let productModal=document.getElementById("productModal")
  const showmodal=new bootstrap.Modal(productModal)
  showmodal.show()


  let submitForm=document.getElementById("submitForm")
  submitForm.addEventListener("click",async()=>{

     let Pname=document.getElementById("productname").value 
  let Pimg=document.getElementById("Productimg").value
  let Pprice=document.getElementById("price").value
  let Pcategory=document.getElementById("category").value
  let Pdiscription=document.getElementById("Discription").value

   if (!Pname || !Pimg || !Pprice || !Pcategory || !Pdiscription) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill out all fields before submitting.",
      });
      return;
    }

  const Newproduct={
    Pname,Pimg,Pprice,Pcategory,Pdiscription
  }
  const docRef=doc(db,"Sellers",logginname.nameSeller)
 try{
  await updateDoc(docRef,{
   products:arrayUnion(Newproduct)
  })
  alert("updated successfully")
 }

 catch(err){
  console.log(err)
 }
 showmodal.hide()
  })

})


let myproducts=document.getElementById("myproducts")
myproducts.addEventListener("click",async()=>{
  aboutcontainer.style.display="none"
  const sellerDoc=doc(db,"Sellers",logginname.nameSeller)
  const sellerDocFinal=await getDoc(sellerDoc)
 if(sellerDocFinal.exists()){
  let product=sellerDocFinal.data()
  let finalproduct=product.products
  localStorage.setItem("productlist",JSON.stringify(finalproduct))

  if(finalproduct.length>0){
    renderproduct(finalproduct)
  }else{
    alert("No more products")
  }
 }
})


let finalproducts=JSON.parse(localStorage.getItem("productlist"))

function renderproduct(abc){
   productContainer.innerHTML=""
   abc.forEach((product)=>{

    let productcard=document.createElement("div")
    productcard.className="productCardDiv"
    productcard.innerHTML=`
    <img src=${product.Pimg} width=200>
    <p>${product.Pname}</p>
    `
    productContainer.append(productcard)
   })
}
renderproduct(finalproducts)
})