window.addEventListener('keydown', (e) => {
  if(e.code == 'F12') {
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.shiftKey && e.code == 'KeyI'){
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.shiftKey && e.code == 'KeyJ'){
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.shiftKey && e.code == 'KeyC'){
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.shiftKey && e.code == 'KeyM'){
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.code == 'KeyU'){
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.code == 'KeyS'){
    e.preventDefault();
    return false;
  }
  if(e.ctrlKey && e.code == 'KeyP'){
    e.preventDefault();
    return false;
  }
});
document.onkeydown = function(e) {
  if(window.event.keyCode == 123) {
    return false;
  }
  if(e.button == 2) {
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'I'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'J'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'C'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && e.shiftKey && window.event.keyCode == 'M'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && window.event.keyCode == 'U'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && window.event.keyCode == 'S'.charCodeAt(0)){
    return false;
  }
  if(e.ctrlKey && window.event.keyCode == 'P'.charCodeAt(0)){
    return false;
  }
}
window.addEventListener("load", () => {try{document.getElementById("wm-ipp-base").outerHTML = ''}catch{}});
//document.ondragstart = () => false;
window.addEventListener('dragstart', (e) => {try{if(e.target.tagName == 'A') return;}catch{} e.preventDefault()}, false);
//document.oncut = () => false;
window.addEventListener('cut', (e) => {try{if(e.target.tagName == 'TEXTAREA') return;}catch{} e.preventDefault()}, false);
document.oncontextmenu = () => false;
window.addEventListener('contextmenu', (e) => e.preventDefault(), false);
document.ondrop = () => false;
window.addEventListener('drop', (e) => e.preventDefault(), false);