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
    .then(res => res.body)
    .then(data => console.log(data.body))
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
  $(document).on("click", ".comment-button", e => {
    $(document).off("click", ".comment-button");
    const inputBox = buildElement("inputBox", "div");
    const textInput = buildElement("textInput", "textarea");
    const postButton = buildElement("postButton", "button");
    postButton.classList.add("btn", "btn-sm", "btn-light");
    postButton.innerHTML = "Post";
    inputBox.classList.add("container");
    textInput.setAttribute("cols", "40");
    textInput.setAttribute("rows", "4");
    inputBox.append(textInput);
    inputBox.append(postButton);
    e.target.parentNode.append(inputBox);
    // e.target.addEventListener("click", function() {
    // $("#inputBox").detach();
    // })
    $(postButton).click(() => console.log(textInput.value));
  });
}

initCommentClicks();
// $(`<div class="media personal-post">
//   <img class="mr-3" src="images/baseDragon.png" alt="dragon!">
//     <div class="media-body">
//       <h5 class="mt-0">Hey</h5>
//       Blah Bloo Words!
//       <button type="button" class="btn-sm comment-button">Comment</button>
//     </div>
//   </div>`)
