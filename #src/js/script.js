//функция добавляет в тег боди класс вебпи, если поддерживается этот формат
function testWebP(callback) {

    var webP = new Image();
    webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
    };
    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    }
    
    testWebP(function (support) {
    
    if (support == true) {
    document.querySelector('body').classList.add('webp');
    }else{
    document.querySelector('body').classList.add('no-webp');
    }
    });


//я нашел в инете
// function testWebP(callback) {
//     var webP = new Image();
//     webP.onload = webP.onerror = function() {
//       callback(webP.height == 2);
//     };
//     webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
//   }
//   testWebP(function(support) {
//    if(support == true) { // <ваш код. переменная support может быть true если webp поддерживается и false если нет>
//     document.querySelector('body').classList.add('webp');
// }
// });

//@@include('alert.js');