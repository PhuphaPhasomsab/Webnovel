let count = 1;
let epContents = {}; // เก็บเรื่องแต่ละตอน 

document.addEventListener("DOMContentLoaded", async () => {

  const addEp_btn = document.getElementById("moreEp");
  const listArea = document.getElementById("epList");
  const novBtn = document.getElementById("novSetting_btn");

  const screen = document.getElementById("rightScreen");

  //โหลดหน้าตั้งค่าเป็นdefault
  screen.innerHTML = baseInfo();
  //กดตั้งค่าข้อมูลพื้นฐานของนิยาย
  novBtn.addEventListener("click", () => {
    screen.innerHTML = baseInfo();
  })

  // กดปุ่ม "more" เพิ่มตอนใหม่
  addEp_btn.addEventListener("click", () => {
    listArea.insertAdjacentHTML("afterbegin", addNewEp(count));
    // ส่งค่ากลับ server(app.js) เพื่อเอาไปแสดงที่ ejs
    fetch("/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count })
    })
    .then(res => res.json())
    .then(data => {
      document.querySelector("#totalEPs").textContent = `ตอนทั้งหมด (${data.totalEp})`;
    });
    count++;
  });

  //Event Delegation: ฟังการคลิกใน epList
  listArea.addEventListener("click", (e) => {
    //เปลี่ยนจำนวนตอนรวม
    const btn = e.target.closest(".eachEP");
    const num = btn.querySelector("strong").textContent.match(/\d+/)[0];
    screen.innerHTML = addEpContent(num);
    //คืนค่านิยายที่แต่งไว้
    const textarea = document.getElementById("epContent");
    if (epContents[num]) textarea.value = epContents[num];
    //บันทึกค่าที่พิมพ์เนื้อหาลงอาเรย์
    textarea.addEventListener("input", () => {
      epContents[num] = textarea.value;
    });
  });
});

//ตรวจสอบแบบฟอร์มหลังกดบันทึก
document.addEventListener("submit", async (event) => {
  if (event.target.id === "form") {
    event.preventDefault();

    const warningParagraph = document.getElementById("warning");
    let errMessages = [];

    const novTitleInput = document.getElementById("novTitle");
    const mainCateChoice = document.getElementById("mainCate");
    const ratingChoice = document.getElementById("rating");
    const novQuoteInput = document.getElementById("novQuote");
    const novShortsInput = document.getElementById("novShorts");

    const inputs = [novTitleInput, mainCateChoice, ratingChoice, novQuoteInput, novShortsInput];

    // เอาแจ้งเตือนออกเมือมีการพิมพ์ใหม่/เปลี่ยนค่าที่เลือก
    inputs.forEach(el => {
      el.addEventListener("input", () => {
        el.classList.remove("is-invalid");
        warningParagraph.innerHTML = "";
      });
      el.addEventListener("change", () => {
        el.classList.remove("is-invalid");
        warningParagraph.innerHTML = "";
      });
    });

    //แสดงกรอบแดงถ้าผู้ใช้ไม่กรอกข้อมูล
    if (novTitleInput.value.trim() === "") {
      errMessages.push("กรุณากรอก ชื่อเรื่อง");
      novTitleInput.classList.add("is-invalid");
    }
    if (novQuoteInput.value.trim() === "") {
      errMessages.push("กรุณากรอก คำโปรย");
      novQuoteInput.classList.add("is-invalid");
    }
    if (novShortsInput.value.trim() === "") {
      errMessages.push("กรุณากรอก เนื้อเรื่องย่อ");
      novShortsInput.classList.add("is-invalid");
    }
    if (mainCateChoice.value === "") {
      errMessages.push("กรุณาเลือก หมวดหมู่หลัก");
      mainCateChoice.classList.add("is-invalid");
    }
    if (ratingChoice.value === "") {
      errMessages.push("กรุณาเลือก ระดับของเนื้อหา");
      ratingChoice.classList.add("is-invalid");
    }
    //แสดงerrorถ้าไม่กรอกฟอร์มที่บังคับ
    if (errMessages.length > 0) {
      warningParagraph.innerHTML = errMessages.join("<br>");
      warningParagraph.classList.add("text-danger");
    } 
    else {
      warningParagraph.innerHTML = "<span class='text-success'>✅ บันทึกสำเร็จ!</span>";
      event.target.submit();//ส่งฟอร์มต่อได้ตามปกติ
    }

    //------------ส่งข้อมูลนิยายที่นักเขียนตั้งค่าไปเก็บที่server------------
    const userId = window.USER_ID;
    const payload = {
      title: novTitleInput.value,
      mainCate: mainCateChoice.value,
      rating: ratingChoice.value,
      quote: novQuoteInput.value,
      shorts: novShortsInput.value
    };

    try {
      const res = await fetch(`/novel/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      alert("บันทึกการตั้งค่านิยายของคุณแล้ว!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  }
});


//-----------------------ส่วนของ Function---------------------------------
//สร้างปุ่มแต่ละตอน
function addNewEp(num) {
  return `
    <div class="d-flex flex-row justify-content-between gap-2 align-items-center">
      <button class="eachEP border-0 rounded h-auto bg-light text-start p-2 mb-2 w-100">
        <strong>ตอนที่ ${num}</strong>
      </button>
      <img src="/images/remove.png" alt="remove_btn" width="30" height="30" />
    </div>
    
  `;
}

//สร้างพื้นที่เขียนเนื้อหานิยายแต่ละตอน
function addEpContent(num) {
  return `
    <div class="d-flex flex-column h-100">
      <!-- แถบตั้งค่า -->
      <div class="d-flex justify-content-end align-items-center p-3 gap-2">
        <button class="btn btn-light btn-sm">บันทึกแบบร่าง</button>
        <button class="btn btn-light btn-sm">บันทึกและเผยแพร่</button>
      </div>

      <!-- ชื่อเรื่อง -->
      <div class="p-3 bg-light">
        <h5 id="novTitle"><strong>ชื่อเรื่อง</strong></h5>
      </div>

      <!-- กรอบเนื้อหา -->
      <div class="flex-grow-1 d-flex flex-column text-dark">
        <!-- หัวตอน -->
        <div class="border-bottom text-center py-3 fs-4">
          <strong>ตอนที่ ${num}#: </strong><input id="epTitle" class="border-0" placeholder="ยังไม่ตั้งชื่อตอน"></input>
        </div>

        <!-- ข้อมูลตอน -->
        <div class="d-flex justify-content-end gap-3 p-2 text-dark">
          <p>อัพเดตเมื่อ: xx/xx/xx</p>
          <p>0 ตัวอักษร</p>
        </div>

        <!-- ส่วนเขียนเนื้อหา -->
        <div class="flex-grow-1 p-3 d-flex justify-content-center align-items-center">
          <textarea id="epContent" class="w-100 h-100 p-3 border-0 rounded" style="background-color: rgba(203, 219, 223, 1);"
              placeholder="พิมพ์ข้อความที่นี่"></textarea>
        </div>
      </div>
    </div>
  `;
}

//หน้าตั้งค่าข้อมูลพื้นฐานนิยาย

function baseInfo(){
  return `
    <div class="d-flex flex-column p-3" style="background-color: rgba(238, 214, 117, 1)">
      <div class="d-flex flex-column bg-light border-0 rounded">
        <h3 class="d-flex justify-content-center border-0 rounded h-auto p-4 bg-light fw-bold">
        ตั้งค่าข้อมูลพื้นฐานของนิยาย</h3>

        <!-- เริ่มส่วนฟอร์ม -->
        <form id="form" class="d-flex flex-column mx-5 mb-4 mt-0" >
          <!-- แถว1 -->
          <!-- style="background-color: rgba(238, 214, 117, 1)" -->
          <label class="fw-bold fs-5 mb-1">ตั้งชื่อเรื่อง*</label>
          <input class="form-control border rounded mb-3  p-2" style="width:400px; height:50px; "
            id="novTitle" placeholder="ชื่อเรื่อง">

          <!-- แถว2 -->
          <div class="d-flex mb-3 gap-2 bg-light">

            <!-- ฝั่งซ้าย-->
            <div style="width:40%; background-color: rgba(215, 166, 217, 1)">
              <label class="fw-bold fs-5 mb-3">ปกเรื่องแนวตั้ง</label>
              <!-- รูป&ปุ่มเลือกไฟล์-->
              <div class="d-flex flex-column align-items-center justify-content-center" >
                <img class="recCovImg border-0 rounded mb-3"
                style="width: 280px; height: 330px; object-fit: cover; cursor: pointer;"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNUOu5kkYIXpcfVS97f1I42o9MnsCL2RrN_33gNdUYpUNKT9hwBe7Oko7lW_-TQ_Y7kKM&usqp=CAU" />
                <input id="recCovFile" type="file" accept="image/*" style="display:none;">
              </div>
            </div>

            <!-- ฝั่งขวา-->
            <div class="d-flex flex-column flex-grow-1" style="background-color: rgba(59, 187, 187, 1)">
              <!-- หมวดหมู่ -->
              <div class="d-flex flex-row p-2 gap-5 mb-2">
                <div class="dropdown">
                  <label class="fw-bold">หมวดหมู่หลัก*</label>
                  <select class="form-control" name="mainCate" id="mainCate" style="width: 200px;">
                      <option value="" disabled selected>เลือก</option>
                      <option value="fantasy">แฟนตาซี</option>
                      <option value="romance">โรแมนติก</option>
                      <option value="fight">ต่อสู้</option>
                  </select>
                </div>
                <div class="dropdown">
                  <label class="fw-bold">หมวดหมู่รอง</label>
                  <select class="form-control" name="secondCate" id="secondCate" style="width: 200px;">
                      <option value="" disabled selected>เลือก</option>
                      <option value="fantasy">แฟนตาซี</option>
                      <option value="romance">โรแมนติก</option>
                      <option value="fight">ต่อสู้</option>
                  </select>
                </div>
              </div>

              <!-- เรต -->
              <div class="d-flex flex-column p-2 gap-3 mb-2">
                <div class="dropdown">
                  <label class="fw-bold">ระดับของเนื้อหา*</label>
                  <select class="rating form-control" name="rating" id="rating">
                      <option value="" disabled selected>เลือก</option>
                      <option value="general">เหมาะสมกับบุคคลทั่วไป</option>
                      <option value="rated">เหมาะสมกับผู้ที่มีอายุ 18 ปีขึ้นไป</option>
                  </select>
                  <div id="rated_choice"></div>
                </div>
                
              </div>

              <!-- แท็ก -->
              <div class="p-2" >
                <label class="fw-bold">แท็ก</label>
                <div class="d-flex flex-row flex-wrap p-2 gap-3">
                  <label class="border border-2 rounded-5 px-2 py-1" style=" border-color: rgba(255, 225, 0, 1)!important;">
                  ย้อนเวลา</label>
                  
                </div>
              </div>
              <!-- คำโปรย -->
              <label class="fw-bold mb-0 m-2">คำโปรย*</label>
              <div class="m-2">
                <textarea class="form-control border-0 rounded p-3  mt-1 mb-3" style="resize: none; height:90px; background-color: rgba(208, 230, 235, 1);"
                id="novQuote" placeholder="พิมพ์คำโปรย"></textarea>
              </div>
              
            </div>
          </div>

          <!-- แถว3 -->
          <div class="d-flex flex-column" >
            <label class="fw-bold mb-2">เรื่องย่อ*</label>
            <textarea 
              class="form-control border-0 rounded p-3"
              style="resize: none; height:150px; background-color: rgba(208, 230, 235, 1);"
              id="novShorts" 
              placeholder="พิมพ์เรื่องย่อ"></textarea>
          </div>
          <div class="d-flex justify-content-center m-4" >
            <button
            type="submit"
            class="border-0 rounded p-2 px-3 fw-bold text-white"
            style=" background-color: rgba(43, 168, 47, 1)">บันทึก</button>
          </div>
          <div id="warning" class="w-auto"></div>
        </form>
        
        
      </div>
    </div>
  `;
  
}
