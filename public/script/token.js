function token(token){
let url = "http://localhost:3000/api/user/welcome";

// if (token != null){
console.log(token)
let xhr = new XMLHttpRequest();
xhr.open("POST", url);

xhr.setRequestHeader("Accept", "application/json");

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.responseText);
    }};

let data = `{
    "token": "${token}"
}`;
xhr.send(data);

if(xhr.status == 200){
    console.log("i work 200")
    if(window.location.href == "http://localhost:3000/" || window.location.href == "http://localhost:3000/index.html" ){
        window.location.replace("/list.html");
    }

}
}
// else
// {
//     // window.location.replace("/")
// }
