//รูปโปรไฟล์นักเขียน
const profImg = document.querySelector(".profImg"),
    profFile = document.querySelector("#profFile")
// คลิกที่รูปให้เปิดมาหน้าเลือกไฟล์
profImg.addEventListener("click", () => {
    profFile.click();
});
profFile.addEventListener("change",()=>{
    profImg.src = URL.createObjectURL(profFile.files[0]);
})

//ปกแนวตั้ง
const recCovImg = document.querySelector(".recCovImg"),
    recCovFile = document.querySelector("#recCovFile")

recCovImg.addEventListener("click", () => {
    recCovFile.click();
});
recCovFile.addEventListener("change", () => {
    recCovImg.src = URL.createObjectURL(recCovFile.files[0]);
})