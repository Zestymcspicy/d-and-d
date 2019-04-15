const signInAlert = $("#signInAlert");
const charForm = document.forms["charForm"];
const userForm = document.forms["userForm"];
const url = "http://localhost:1234";
const newUserFormLines = document.getElementById("forNewUser");
const newUserButton = document.getElementById("newUserButton");
const displayName = document.getElementById("inputUserName");
const password = document.getElementById("inputPassword");
const email = document.getElementById("inputEmail");
const passwordMatch = $("#inputPasswordMatch")[0];
const signInButton = $("#sign-in-button");
let isNewUser = false;
let user;
newUserButton.addEventListener("click", () => toggleSignInForm());

function buildElement(elName, type) {
  let id = elName;
  elName = document.createElement(`${type}`);
  elName.id = id;
  return elName;
}

function toggleSignInForm() {
  if (isNewUser === true) {
    newUserFormLines.setAttribute("class", "forNewUserHidden");
    isNewUser = false;
    newUserButton.innerHTML = "New User?";
  } else {
    newUserFormLines.setAttribute("class", "forNewUserVisible");
    isNewUser = true;
    newUserButton.innerHTML = "Back to SignIn";
  }
}

function userSignIn() {
  fetch(`${url}/users/login/`, {
    method: "POST",
    body: `displayName=${displayName.value}&password=${password.value}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .catch(err => console.log(err))
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        console.log(data);
        signInButton.text("Switch User");
        // $(".comment-button").removeAttr("disabled");
        user = data.user;
        $("#sign-in-modal").modal("toggle"); //or  $('#IDModal').modal('hide');
        return false;
      } else {
        $("#signInAlert").text(data.message);
        console.log(data.message);
        $("#signInAlert").removeAttr("hidden");
      }
    });
}

async function addUser() {
  await fetch(`${url}/users/create/`, {
    method: "POST",
    body: `displayName=${displayName.value}&password=${password.value}&email=${
      email.value
    }`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => console.log(res))
    .catch(err => console.log(err));
}

function checkNewUserForm() {}

function addCharacter() {
  const name = document.getElementById("nameInput");
  const level = document.getElementById("levelInput");
  const charClass = document.getElementById("classInput");

  fetch(`${url}/characters/create/`, {
    method: "POST",
    body: `name=${name.value}&level=${level.value}&class=${charClass.value}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => console.log(res))
    .catch(err => console.log(err));
}

userForm.addEventListener(
  "submit",
  function(e) {
    if (isNewUser) {
      addUser();
    } else {
      userSignIn();
    }
    e.preventDefault();
  },
  false
);
// <h5 class="mt-0">${user.displayName}</h5>
function initCommentClicks() {
  initCommentCollapsers()
  $(document).on("click", ".comment-button", e => {
    buildInputBox(e.target);
    e.stopImmediatePropagation()
    $(document).off("click", ".comment-button");
    e.target.addEventListener("click", function(e) {
      e.stopImmediatePropagation()
      $("#inputBox").remove();
      resetCommentClicks();
    })
  });
}

//experiencing difficulty rebuilding input box after closing
function resetCommentClicks() {
  initCommentClicks()
}
//constructed the input box with regular javascript rather than templating
function buildInputBox(target) {
  const inputBox = buildElement("inputBox", "div");
  const textInput = buildElement("textInput", "textarea");
  const postButton = buildElement("postButton", "button");
  const parentDiv = target.parentElement;
  postButton.classList.add("btn", "btn-sm", "btn-light");
  postButton.innerHTML = "Post";
  inputBox.classList.add("container");
  textInput.setAttribute("cols", "40");
  textInput.setAttribute("rows", "4");
  inputBox.append(textInput);
  inputBox.append(postButton);
  target.after(inputBox);
  $(postButton).click((e) => {
    sendPost(textInput.value, "hal", parentDiv);
    $("#inputBox").remove();
  });
}

function sendPost(content, displayName, parentDiv) {
  const data = {
    displayName: displayName,
    content: content,
    childOf: parentDiv.id
  };
  fetch(`${url}/comments/add/`, {
    method: "POST",
    body: `displayName=${displayName}&content=${content}&childOf=${parentDiv.id}`,
    // body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.json())
    .then(data => buildComment(data.comment))
    .catch(err => console.log(err));
}

function getComments() {
  fetch(`${url}/comments/get`)
  .then(res=>res.json())
  .then(data=> data.forEach(comment => buildComment(comment)))
  .catch(err=> console.log(err))
}

getComments();
initCommentClicks();

function buildComment(commentObj){
//comment template using template literal
  let comment = `<div class="continer-fluid d-flex">
  <button class="hidePostsButton align-self-start">[-]</button>
  <div class="media personal-post" id="childOf${commentObj.childOf}">
  <img class="mr-3" src="images/baseDragon.png" alt="dragon!">
    <div class="media-body" id=${commentObj._id}>
      <h5 class="mt-0">${commentObj.displayName}</h5>
      ${commentObj.content}
      <button type="button" class="comment-button">Comment</button>
    </div>
  </div>
  </div>`
  $(`#${commentObj.childOf}`).append(comment);
  initCommentClicks()
}

function initCommentCollapsers() {
  $('.hidePostsButton').click(function(e){
    e.stopImmediatePropagation()
    console.log("hello")
    if(e.target.innerHTML==='[-]'){
      e.target.innerHTML='[+]';
      e.target.nextElementSibling.classList.add("hidden")
    } else {
      e.target.innerHTML='[-]';
      e.target.nextElementSibling.classList.remove("hidden")
    }

  })
}
