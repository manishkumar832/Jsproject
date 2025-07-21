import { doc, collection, setDoc, updateDoc, getDocs, arrayUnion, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"
import { signOut } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js"
import { db, authentication } from "./fbconfig.js"


document.addEventListener("DOMContentLoaded", async () => {

  let logginname = JSON.parse(localStorage.getItem("sellerCredentials"))
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


  // when I click Shop Now BUtton This Works

  const shopnow = document.getElementById("product")
  const categorycontainer = document.getElementById("categorycontainer")
  shopnow.addEventListener("click", () => {
    bagContainer.style.display = "none"
    aboutcontainer.style.display = "none"
    categorycontainer.innerHTML = ""
    ordersContainer.innerHTML = "";

    let frontimage = document.createElement("div")
    frontimage.className = "categoryimg"
    frontimage.innerHTML = `
        <div class="item">
      <img src="https://cdn.suitableshop.com/images/317x486/products/suitable-pique-shirt-jeans-blue--full--86419-1.jpg?pr=suitable&processing_options=pd:50/resize:fit:217:323:1:1" data-category="Shirts" width="150">
      <p> Shirts</p>
    </div>
    <div class="item">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4vcDmJlMHsrQo2O42IelYhM-Gh39DeAJ1Hlqx2Mb2YTXlfNAMdF9hpYA4y1lEoQXLyyw&usqp=CAU" data-category="Jeans" width="150">
      <p> Jeans</p>
    </div>
    <div class="item">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNVQyFrhhBWiPETUx98Umeprd0zba6BaIf5A&s" data-category="Blazzerz" width="150">
      <p>Blazzers</p>
    </div>
    <div class="item">
      <img src="https://egoss.in/cdn/shop/files/7_823bce61-02ed-4032-8d10-5ea93ea2fff2.png?v=1710408760&width=1080" data-category="Shoes" width="150">
      <p>Shoes</p>
    </div>
       `
    categorycontainer.append(frontimage)
    categorycontainer.style.display = "block"
    setupCategoryClicks();
  })
  let Aboutdetail = document.getElementById("toggleBtn")
  let aboutcontainer = document.getElementById("aboutcontainer")
  let isvisible = false
  Aboutdetail.addEventListener("click", () => {
    container.innerHTML = ""
    categorycontainer.innerHTML = ""
    bagContainer.innerHTML = ""
    ordersContainer.innerHTML = "";
    if (isvisible) {
      aboutcontainer.style.display = "none"

    } else {
      if (logginname) {
        aboutcontainer.innerHTML = `
     <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" width=200 id="profilelogo">
    <p><strong>Name:</strong>${logginname.nameSeller.toUpperCase()}</p>
    <p><strong>Email:</strong>${logginname.email}</p>
    <p><strong>Role:</strong>${logginname.role.toUpperCase()}</p>
    `
        aboutcontainer.style.display = "block"
      }
    }
    isvisible = !isvisible
  })


  //it for all seller products to display cards for buyer

  let allProducts = []
  async function fetchAllProducts() {
    const sellersRef = collection(db, "Sellers");
    const sellersProduct = await getDocs(sellersRef);
    // const allProducts = [];

    sellersProduct.forEach(doc => {
      const data = doc.data();
      const products = data.products || [];
      products.forEach(product => {
        allProducts.push({
          seller: data.name,
          Pname: product.Pname,
          Pcategory: product.Pcategory,
          Pprice: product.Pprice,
          Pimg: product.Pimg,
          Pdiscription: product.Pdiscription || '',
        });
      });
    });
    console.log(allProducts)
  }

  await fetchAllProducts();

  function setupCategoryClicks() {
    document.querySelectorAll(".item img").forEach((img) => {
      img.addEventListener("click", () => {
        const category = img.getAttribute("data-category");
        console.log("Clicked category:", category);
        console.log("All product categories:", allProducts.map(p => p.Pcategory));

        const filtered = allProducts.filter(p =>
          p.Pcategory.trim().toLowerCase() === category.trim().toLowerCase()
        );
        console.log("Filtered products:", filtered);
        displayProducts(filtered);
      });
    });
  }


  // to display Buyer products category

  const container = document.getElementById("products-container") || createProductContainer();
  function displayProducts(products) {
    container.innerHTML = ""

    if (!products.length) {
      container.innerHTML = "<p>No products found in this category.</p>";
      return;
    }
    products.forEach((p) => {
      const div = document.createElement("div");
      div.classList.add("product-item");
      div.innerHTML = `
      
      <img src="${p.Pimg}" alt="${p.Pname}" width="100" />
       <h4>${p.Pname}</h4>

      <button id="bagBtn">👜</button>
    `;
      container.appendChild(div);

      const Bag = div.querySelector("#bagBtn")
      Bag.addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("sellerCredentials"));
        if (!user) {
          alert("Please login to add to your bag.");
          return;
        }

        const userId = user.email;

        const bagRef = doc(db, "UserCarts", userId);

        try {
          await updateDoc(bagRef, {
            items: arrayUnion(p)
          });
        } catch (error) {
          if (error.code === "not-found") {
            await setDoc(bagRef, { items: [p] });
          } else {
            console.error("Error updating bag:", error);
          }
        }

         await displaycartProduct(true);
        Swal.fire({
          title: "Added to Bag",
          text: `"${p.Pname}" has been added to your bag.`,
          icon: "success",
          timer: 1000,
          showConfirmButton: false
        });

      });
    })

    function createProductContainer() {
      const container = document.createElement("div");
      container.id = "products-container";
      document.body.appendChild(container);

    }
  }


  // To display Products When i click Bag button on navbar

  const bagContainer = document.getElementById("bagContainer")
  const orderCountSpan = document.getElementById("bagCount")


  async function displaycartProduct(updateOnlyCount = false) {
    bagContainer.innerHTML = "";

    const user = JSON.parse(localStorage.getItem("sellerCredentials"));
    if (!user) {
      if (!updateOnlyCount) {
        bagContainer.innerHTML = "<p>Please login to view your bag.</p>";
      }
      if (orderCountSpan) orderCountSpan.textContent = "0";
      return;
    }
    const userId = user.email;
    const bagRef = doc(db, "UserCarts", userId);

    try {
      const bagSnap = await getDoc(bagRef);
      if (bagSnap.exists()) {
        const data = bagSnap.data();
        const bagList = data.items || [];

        if (orderCountSpan) {
          orderCountSpan.textContent = bagList.length;
        }

        if (updateOnlyCount) return;

        if (bagList.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Your bag is empty',
            text: 'Add some products before placing an order!',
          });
        }


        bagList.forEach((item, index) => {
          const div = document.createElement("div");
          div.classList.add("baglist-item");
          div.innerHTML = `
          <img src="${item.Pimg}" alt="${item.Pname}" width="80" />
          <div id="rightBag">
          <h4>${item.Pname}</h4>
          <p>Price: ₹${item.Pprice}</p>
          <p><strong>Description:</strong> ${item.Pdiscription || "No description available."}</p>     
          <span class="order-btn">ORDER NOW</span>
          <i class="fa-solid fa-trash"></i>
        `
          bagContainer.appendChild(div);

          const deleteBtn = div.querySelector(".fa-trash");
          deleteBtn.addEventListener("click", async () => {
            const user = JSON.parse(localStorage.getItem("sellerCredentials"));
            const userId = user.email;

            await deleteCardByIndex(userId, index);
            await displaycartProduct();
          });
          const orderbtn = div.querySelector(".order-btn")
          orderbtn.addEventListener("click", (e) => {
            let orderModal = document.getElementById("orderModal")
            const showmodal = new bootstrap.Modal(orderModal)
            showmodal.show()

            let confirmOrderBtn = document.getElementById("orderclick");



            confirmOrderBtn.replaceWith(confirmOrderBtn.cloneNode(true));
            confirmOrderBtn = document.getElementById("orderclick");



            confirmOrderBtn.addEventListener("click", async () => {

              const customerName = document.getElementById("customername").value.trim();
              const address = document.getElementById("address").value.trim();
              const contact = document.getElementById("contact").value.trim();

              if (!customerName || !address || !contact) {
                Swal.fire({
                  icon: "warning",
                  title: "Incomplete Form",
                  text: "Please fill out all fields before confirming the order.",
                });
                return;
              }

              const user = authentication.currentUser;
              const localUser = JSON.parse(localStorage.getItem("sellerCredentials"));

              if (!user || !localUser) {
                Swal.fire({
                  icon: "error",
                  title: "Not Logged In",
                  text: "Please log in to place an order.",
                });
                return;
              }

              try {

                const userOrdersRef = collection(db, "users", user.uid, "orders");
                await addDoc(userOrdersRef, {
                  customerName,
                  address,
                  contact,
                  productName: item.Pname,
                  productImage: item.Pimg,
                  price: item.Pprice,
                  userEmail: user.email,
                  status: "Pending",
                  createdAt: new Date().toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })
                });

                const bagRef = doc(db, "UserCarts", localUser.email);
                const bagSnap = await getDoc(bagRef);
                if (bagSnap.exists()) {
                  const bagData = bagSnap.data();
                  const updatedItems = bagData.items.filter((_, i) => i !== index);
                  await updateDoc(bagRef, {
                    items: updatedItems
                  });
                }
                await displaycartProduct(true); 
                div.remove()
                document.getElementById("customername").value = "";
                document.getElementById("address").value = "";
                document.getElementById("contact").value = "";


                showmodal.hide()

                Swal.fire({
                  icon: "success",
                  title: "Order Confirmed",
                  text: "Your order has been placed and removed from your bag.",
                });

              } catch (error) {
                console.error("Error placing order:", error);
                Swal.fire({
                  icon: "error",
                  title: "Order Failed",
                  text: "There was an error placing the order. Please try again.",
                });
              }
            });

          })



        });
      } else {
        bagContainer.innerHTML = "<p>Your bag is empty.</p>";

      }
    } catch (error) {
      console.error("Error fetching bag:", error);
      bagContainer.innerHTML = "<p>Failed to load bag items.</p>";
    }
  }

  let CartBtn = document.getElementById("bagcart")
  CartBtn.addEventListener("click", () => {
    aboutcontainer.style.display = "none"
    container.innerHTML = ""
    categorycontainer.innerHTML = ""
    bagContainer.style.display = "grid"
    ordersContainer.innerHTML=""

    displaycartProduct()

  })
  window.addEventListener("DOMContentLoaded", () => {

    displaycartProduct(true); 
  });

  // This is For To delete Card

  async function deleteCardByIndex(userId, indexToDelete) {
    const bagRef = doc(db, "UserCarts", userId);
    try {
      const bagSnap = await getDoc(bagRef);
      if (bagSnap.exists()) {
        const bagData = bagSnap.data();
        const items = bagData.items || [];
        const updatedItems = items.filter((_, idx) => idx !== indexToDelete);

        await updateDoc(bagRef, { items: updatedItems });
        console.log("Deleted card at index:", indexToDelete);
      }
    } catch (error) {
      console.error("Error deleting by index:", error);
    }
  }


  // this is for to display cards when i click on myorders on Navbar and store orders in fb

  document.getElementById("myOrdersBtn").addEventListener("click", async () => {
    const user = authentication.currentUser;

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please log in to view your orders.",
      });
      return;
    }

    const ordersContainer = document.getElementById("ordersContainer");
    ordersContainer.innerHTML = "";
    bagContainer.style.display = "none"
    aboutcontainer.style.display = "none"
    categorycontainer.style.display = "none"
    container.innerHTML = ""


    try {
      const ordersRef = collection(db, "users", user.uid, "orders");
      const querySnapshot = await getDocs(ordersRef);

      if (querySnapshot.empty) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const order = doc.data();

        const card = document.createElement("div");
        card.className = "ordercard";

        card.innerHTML = `
        <img src="${order.productImage}" class="card-img-top" alt="Product Image">
        <div class="card-body">
          <h5 class="card-title">${order.productName}</h5>
          <p class="card-text"><strong>Customer:</strong> ${order.customerName.toUpperCase()}</p>
          <p class="card-text"><strong>Address:</strong> ${order.address}</p>
          <p class="card-text"><strong>Contact:</strong> ${order.contact}</p>
          <p class="card-text"><strong>Ordered On:</strong> ${order.createdAt}</p>
          <p class="card-text"><strong>Price:</strong> ₹${order.price}</p>

        </div>
      `;

        ordersContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      ordersContainer.innerHTML = "<p>Failed to load orders.</p>";
    }
  });



})


