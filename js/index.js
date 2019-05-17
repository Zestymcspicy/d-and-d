// const s3 = new AWS.S3({endpoint: "http://dandd-uploads.s3.us-east-1.amazonaws.com/"});
// const url = "http://localhost:1234";
const url = "https://pacific-headland-65956.herokuapp.com"
const signInAlert = $("#signInAlert");
const charForm = document.forms["charForm"];
const userForm = document.forms["userForm"];
const newUserFormLines = document.getElementById("forNewUser");
const newUserButton = document.getElementById("newUserButton");
const displayName = document.getElementById("inputUserName");
const password = document.getElementById("inputPassword");
const email = document.getElementById("inputEmail");
const passwordMatch = $("#inputPasswordMatch")[0];
const signInButton = $("#sign-in-button");
let quill;
let isNewUser = false;
let allCharacters = [];
let userCharacters = [];
let user = {};
let currentCharacter = {};
let author = "";
let postAuthObj = {
  icon: "",
  name: "",
  auth_id: "",
}
let iconsArray = [
  "armor",
  "axe",
  "axe2",
  "axeDouble",
  "axeDouble2",
  "baseDragon",
  "bow",
  "dagger",
  "hammer",
  "helmet",
  "shield",
  "upg_armor",
  "upg_axe",
  "upg_axeDouble",
  "upg_bow",
  "upg_hammer",
  "upg_helmet",
  "upg_shield",
  "upg_spear",
  "upg_sword",
  "upg_wand",
  "wand",
  "woodSword"
];

newUserButton.addEventListener("click", () => toggleSignInForm());

$("#character-search-input").on("input", function(e) {
  filterAllCharactersBy(e.target.value)
})

$("#allGoodCheck").click(e => {
  e.target.checked?
  $("#characterSubmitButton").removeAttr('disabled'):
  $("#characterSubmitButton").attr('disabled', true);
})

$("#addCharacterButton").click(e => switchMainContent(e.target));

$("#addCharacterForm").submit(e => {
  e.preventDefault();
  addCharacter();
})

$(".dropdown-item").click(e => switchMainContent(e.target));


//switches main content to the data-page attribute of the selected button
function switchMainContent(target) {
  $(".main-content").addClass("hidden");
  $(`#${target.dataset.page}Page`).removeClass("hidden");
}

function buildElement(elName, type) {
  let id = elName;
  elName = document.createElement(`${type}`);
  elName.id = id;
  return elName;
}

function toggleSignInForm() {
  if (isNewUser === true) {
    newUserFormLines.setAttribute("class", "hidden");
    isNewUser = false;
    newUserButton.innerHTML = "New User?";
  } else {
    newUserFormLines.setAttribute("class", "visible");
    isNewUser = true;
    newUserButton.innerHTML = "Back to SignIn";
  }
}

async function getAllCharacters() {
  await fetch(`${url}/characters/get`)
  .then(res => res.json())
  .then(data => allCharacters = data.body)
  .catch(err => console.log(err))
}

async function userSignIn() {
  await fetch(`${url}/users/login/`, {
    method: "POST",
    body: `displayName=HopsTheDog&password=ImaCuteDog`,
    // body: `displayName=LarryTheCat&password=ImaStupidCat`,
    // body: `displayName=${displayName.value}&password=${password.value}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .catch(err => console.log(err))
    .then(res => res.json())
    .then(data => {
      if (data.success === true) {
        user = data.user;
        postAuthObj = {
          icon: user.icon,
          name: user.displayName,
          auth_id: user._id,
        }
        $("#sign-in-modal").modal("toggle");
        //basic setup on login
        setForUser()
        return false;
      } else {
        $("#signInAlert").text(data.message);
        $("#signInAlert").removeAttr("hidden");
      }
    });
}

async function addUser() {
  await fetch(`${url}/users/create/`, {
    method: "POST",
    body: `displayName=${displayName.value}&password=${password.value}&email=${
      email.value}&passwordMatch=${passwordMatch.value
    }`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.json())
    .then(data => {
      if(data.message==="success"){
        user = data.user;
        $("#sign-in-modal").modal("toggle");
        //basic setup on login
        setForUser()
        return false;
      } else {

        if(!data.displayName){
          data.displayName="";
        }
        if(!data.email){
          data.email="";
        }
        if(!data.password) {
          data.password="";
        }
        if(!data.passwordMatch){
          data.passwordMatch="";
        }
        const errorMessage = `${data.displayName}
          ${data.email}
          ${data.password}
          ${data.passwordMatch}`
        $("#signInAlert").text(errorMessage)
        $("#signInAlert").removeAttr("hidden");
      }

    })
    .catch(err => console.log(err));
}

function addCharacter() {
  const name = document.getElementById("nameInput");
  const level = document.getElementById("levelInput");
  const charClass = document.getElementById("classInput");
  const race = document.getElementById("raceInput");
  fetch(`${url}/characters/create/`, {
    method: "POST",
    body: `name=${name.value}&level=${level.value}&class=${
      charClass.value
    }&user=${user._id}&race=${race.value}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.json())
    .then(data => {
      allCharacters.push(data.body);
      userCharacters.push(data.body);
      user.characters.push(data.body._id);
      //reset character management page
      buildAllCharactersPage(allCharacters);
      buildCharacterManagementPage();
      $("#addCharacterPage").addClass('hidden');
      $("#characterManagementPage").removeClass('hidden');
    })
    .catch(err => console.log(err));
}

async function getSignedRequest(file){
  return fetch(`${url}/sign-s3?file-name=${file.name}&file-type=${file.type}`)
  .then(res => res.json())
  .then(data => uploadImage(file, data.signedRequest, data.url))
  .catch(err=> console.log(err))
};

async function uploadImage(file, signedRequest, iconUrl) {
  return fetch(signedRequest, {
    method: "PUT",
    body: file
  })
  .then(() => {
    return iconUrl;
  })
  .catch(err => console.log(err))
}

userForm.addEventListener(
  "submit",
  function(e) {
    e.preventDefault();
    if (isNewUser) {
      addUser();
    } else {
      userSignIn();
    }
  },
  false
);

function filterAllCharactersBy(input) {
  let filteredList = allCharacters;
  if(input!==""){
    filteredList = allCharacters.filter(x => {
      if(x.name.toLowerCase().includes(input.toLowerCase())){
        return x;
      };
    })
    filteredList.sort(function(a,b){
      return a.name.toLowerCase().indexOf(input.toLowerCase())-b.name.toLowerCase().indexOf(input.toLowerCase());
    })
  }
  buildAllCharactersPage(filteredList)
}

function initCommentClicks() {
  initCommentCollapsers();
  $(document).on("click", ".comment-button", e => {
    e.stopImmediatePropagation();
    if(!user.displayName) {
      alert("you must be logged in to do that!");
      return
    }
    e.target.innerHTML = "Comment As...";
    addSelectorDropdown(e.target);
    buildInputBox(e.target, "mediaComment");
    $(document).off("click", ".comment-button");
    e.target.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      resetCommentClicks();
      $("#inputBox").remove();
    });
  });
}

function addSelectorDropdown(target) {
  const authorList = userCharacters.slice(0, userCharacters.length);
  authorList.unshift(user);
  const nameList = buildElement("name-list", "div");
  nameList.classList.add("dropdown-menu");
  authorList.forEach(x => {
    if(x.displayName){
      x.name=x.displayName;
    }
    const item = buildElement(x.name, "a")
    item.classList.add("dropdown-item")
    item.innerHTML = x.name;
    nameList.append(item);
    item.addEventListener("click", (e) => {
      e.stopImmediatePropagation()
      postAuthObj.auth_id = x._id;
      postAuthObj.name = x.name;
      postAuthObj.icon = x.icon;
      nameList.remove();
    })
  })
  nameList.style.display="block";
  target.append(nameList);
}
//experiencing difficulty rebuilding input box after closing
function resetCommentClicks() {
  $(".comment-button").text("Comment");
  initCommentClicks();
}
//constructed the input box with regular javascript rather than templating
function buildInputBox(target, type) {
  const inputBox = buildElement("inputBox", "div");
  const textInput = buildElement("textInput", "textarea");
  const parentDiv = target.parentElement;
  inputBox.classList.add("container");
  textInput.setAttribute("cols", "40");
  textInput.setAttribute("rows", "4");
  inputBox.append(textInput);
  if ((type === "mediaComment")) {
    const postButton = buildElement("postButton", "button");
    const mediaAncestor = parentDiv.parentElement.parentElement;
    postButton.classList.add("btn", "btn-sm", "btn-light");
    postButton.innerHTML = "Post";
    inputBox.append(postButton);
    parentDiv.before(inputBox);
    $(postButton).click(e => {
      sendPost(textInput.value, user.displayName, mediaAncestor);
      $("#inputBox").remove();
    });
  }
  if ((type === "characterSummary")) {
    const updateSummaryButton = buildElement("updateSummaryButton", "button");
    updateSummaryButton.classList.add("btn", "mt-1", "btn-sm", "btn-light");
    updateSummaryButton.innerHTML = "Update";
    inputBox.append(updateSummaryButton);
    const presentSummary = $("#characterSummary").text();
    textInput.value = presentSummary;
    $("#characterSummary").after(inputBox);
    $(updateSummaryButton).click(e=> {
      updateCharacter(textInput.value, "summary");
      $("#inputBox").remove();
    })
  }
}

function sendPost(content, displayName, parentDiv) {
  const data = {
    displayName: displayName,
    content: content,
    childOf: parentDiv.id,
    icon: postAuthObj.icon
  };
  fetch(`${url}/comments/add/`, {
    method: "POST",
    body: `auth_id=${postAuthObj.auth_id}&displayName=${postAuthObj.name}&content=${content}&childOf=${
      parentDiv.id
    }&icon=${postAuthObj.icon}`,

    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      buildComment(data.comment);
    })
    .catch(err => console.log(err));
}

function getComments() {
  fetch(`${url}/comments/get`)
    .then(res => res.json())
    .then(data => constructComments(data))
    .catch(err => console.log(err));
}

function constructComments(data) {
  data.forEach(comment => buildComment(comment))
}


function buildComment(commentObj) {
  if(!commentObj.icon){
    commentObj.icon="images/baseDragon.png"
  }
  //comment template using template literal add disabled to comment button
  let comment = `<div class="personal-post mb-1 continer-fluid d-flex">
  <button class="hidePostsButton align-self-start">[-]</button>
  <div class="media pb-1" id="childOf${commentObj.childOf}">
  <img class="mr-3 avatar" src=${commentObj.icon} alt="dragon!">
    <div class="media-body" id=${commentObj._id}>
      <h6 class="mt-0 mb-1">${commentObj.displayName}</h6>
      <p class="mb-1">${commentObj.content}</p>
      <div>
        <div class="btn-group" role="group" disabled>
          <button type="button" class="btn-light btn btn-sm mr-1 comment-button">Comment</button>
          <button type="button" class="btn-light btn btn-sm mr-1 aye-button">Aye!</button>
          <button type="button" class="btn-light btn btn-sm nay-button">Nay!</button>
        </div>
      </div>
    </div>
  </div>
  </div>`;
  $(`#${commentObj.childOf}`).append(comment);
  initCommentClicks();
}

function initCommentCollapsers() {
  $(".hidePostsButton").click(function(e) {
    e.stopImmediatePropagation();
    if (e.target.innerHTML === "[-]") {
      e.target.innerHTML = "[+]";
      e.target.nextElementSibling.classList.add("hidden");
    } else {
      e.target.innerHTML = "[-]";
      e.target.nextElementSibling.classList.remove("hidden");
    }
  });
}

function buildCharacterManagementPage() {
  $("#characterPageHeader").text(`${user.displayName}'s Characters`);
  if(document.getElementById("characterManagementIconColumn")) {
      $("#characterManagementIconColumn").remove();
  }
  $("#characterPageHeader").before(`<div id="characterManagementIconColumn" class="col-3"><button data-target="#icon-modal" data-toggle="modal" class="btn btn-outline mt-0">Choose Avatar</button><img id="user-icon" class="img-fluid mb-2" src=${user.icon} alt="user-icon"/></div>`);
  $('#characterList').children().remove();
  populateIconModal("user");
  $("#addCharacterButton").removeAttr("disabled");
  userCharacters.forEach((char, idx) => {
    buildCharacterBox(char, idx, $("#characterList"));
  });
  $(".characterSelectButton").click(e => {
    e.stopImmediatePropagation();
    selectCharacter($(e.delegateTarget)[0]);
  });
}

function buildCharacterBox(characterObj, idx, page) {
  if(characterObj.icon==undefined){
    const dragon = "images/baseDragon.png";
    characterObj.icon = dragon;
  }
  const charBox = `<li class="container mt-2 pb-0 mb-1 list-group-item">
    <div data-page="character" id=${characterObj._id} aria-role="${
    characterObj.name
  } button" class="row characterSelectButton">
      <div class="col-2">
          <img src=${characterObj.icon} class="avatar">
      </div>
      <h4 class="col-10">${characterObj.name}</h4>
    </div>
    <div class="row">
      <p class="col-sm">Race: ${characterObj.race}</p>
      <p class="col-sm">Class: ${characterObj.class}</p>
      <p class="col-sm">Level: ${characterObj.level}</p>
    </div>
  </li>`;
  page.append(charBox);
}

function selectCharacter(target) {
  currentCharacter = allCharacters.filter(char => char._id === target.id)[0];
  buildCharacterPage(currentCharacter);
  switchMainContent(target);
}

function buildCharacterPage(currentCharacter){
  $('#characterPageJumbo').empty();
  let journalUpdateButton = "";
  let editButton = "";
  let switchImageButton = "";
  let summary = "Add a summary";
  if(currentCharacter.summary){
    summary = currentCharacter.summary;
  }
  if (
    userCharacters.filter(x => x._id === currentCharacter._id).length !== 0
  ) {
    editButton = `<button data-char_id=${
      currentCharacter._id
    } id='editCharacterSummaryButton'class='btn mt-0'>Edit</button>`;
    switchImageButton = `<button data-char_id=${
      currentCharacter._id
    } id='chooseCharacterImageButton' data-target="#icon-modal" data-toggle="modal" class='btn btn-outline mt-0'>Choose Image</button>`;
    journalUpdateButton = `<button id="editJournal" data-page="journalEditor">Edit Journal</button>`
  } else {
    editButton = "";
  }
  const charInfo = `<div class="container">
  <div class="row">
  <div class="col">
  ${switchImageButton}
  <img class="character-image mr-2" src="${currentCharacter.icon}">
  </div>
  <div class="col">
  <h1>${currentCharacter.name}</h1>
  <h6>Race: ${currentCharacter.race}</h6>
  <h6>Class: ${currentCharacter.class}</h6>
  </div>
  </div>
  <div class="row">
    <h5 class="mb-0 mt-1">Summary</h5>${editButton}
  </div>
  <p id="characterSummary">${summary}</p>
  ${journalUpdateButton}
  <div id="journals-top"></div>
  </div>`;
  $("#characterPageJumbo").append(charInfo);
  addJournals()
  if (editButton !== "") {
    addJournalListener();
    addEditListener();
    addSelectImageListener();
  }
}

function addJournalListener() {
  $("#editJournal").click(e => {
    switchMainContent(e.target)
    $("#openNewJournalEntry").click(e=> {
      const editor=`<div id="editorContainer">
      <div id="editor">
      </div>
      <button id="submitNewJournalEntry" data-page="character">Submit</button>
      </div>`
      $("#journalEditorPageMain").append(editor);
      quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{header: [1, 2, 3] }],
            ['bold', 'italic', 'underline'],
            ['image']
          ]
        }
      });
      $("#submitNewJournalEntry").click((e)=> {
        addNewJournalEntry();
        switchMainContent(e.target);
        buildCharacterPage(currentCharacter);
      })
    })
  });
}

function buildAllCharactersPage(characters) {
  if($("#allCharactersList").children()){
    $("#allCharactersList").children().remove();
  }
  characters.forEach((char, idx) => {
    buildCharacterBox(char, idx, $("#allCharactersList"));
  });
  $(".characterSelectButton").click(e => {
    e.stopImmediatePropagation();
    selectCharacter($(e.delegateTarget)[0]);
  });
}


function addNewJournalEntry() {
  let contents = quill.getContents();
  let entry = {
    _id: Date.now(),
    contents: contents
  };
  entry = JSON.stringify(entry);
  updateCharacter(entry, "journals");
}

function addSelectImageListener() {
  $("#chooseCharacterImageButton").click(e => {
    populateIconModal("character");
  });
}

function addEditListener() {
  $("#editCharacterSummaryButton").click(e => {
    buildInputBox(e.target, "characterSummary");
  });
}

function populateIconModal(type) {
  $("#iconsBox").children().remove();
  iconsArray.forEach(x => {
    const iconButton = buildElement(x, 'button');
    iconButton.classList.add('btn', 'icon-button');
    iconButton.innerHTML = `<img data-target="#icon-modal" data-toggle="modal" class='icon-select-image' src='images/${x}.png'>`
    $("#iconsBox").append(iconButton);
    iconButton.addEventListener("click", () => {
      if(type==="character"){
        updateCharacter(`images/${x}.png`, "icon");
      }
      if(type==="user") {
        updateUserAvatar(`images/${x}.png`);
      }
    })
  });
  $("#iconsBox").append(`<form enctype="multipart/form-data" class='btn icon-button d-flex'><label for="avatar">Choose your own</label>
    <input class="mb-1" type="file" id="icon-file-pick" name="avatar" accept="image/png, image/jpeg"></form>`)
  const fileInput = document.getElementById("icon-file-pick");
  fileInput.addEventListener("change", function() {
    selectFile();
    $("#icon-modal").modal("toggle")
  }, false)

  async function selectFile() {
    await getSignedRequest(fileInput.files[0])
    .then(res => {
      console.log(res);
      if(type==="character"){
        updateCharacter(res, "icon");
      }
      if(type==="user") {
        updateUserAvatar(res);
      }
    })
  }
}

function updateUserAvatar(iconUrl){
    fetch(`${url}/users/${user._id}/image`, {
      method: 'POST',
      body: `icon=${iconUrl}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(res => res.json())
    .then(data => {
      user = data.user;
      buildCharacterManagementPage();
    })
    .catch(err => console.log(err))
}

function updateCharacter(content, type) {
  fetch(`${url}/characters/${currentCharacter._id}/update`, {
    method: "PUT",
    body: `type=${type}&content=${content}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      allCharacters.push(data.body)
      currentCharacter = data.body
      buildCharacterPage(currentCharacter);
   })
    .catch(err => console.log(err));
}

function assignCharacters() {
  userCharacters=[];
    for(let i = 0; i<user.characters.length; i++){
      for(let j = 0; j<allCharacters.length; j++){
        if(user.characters[i]===allCharacters[j]._id){
          userCharacters.push(allCharacters[j]);
        }
      }
    }
}

function addJournals() {
  if(currentCharacter.journals){
    const journalDivs = currentCharacter.journals.forEach(entry => {
      let quillText = new Quill(document.createElement("div"));
      let deleteEdit;
      if(currentCharacter.user === user._id){
        deleteEdit = `<div class="mt-1 button-group">
        <button type="button" class="btn btn-warning">Edit</button>
        <button type="button" class="btn btn-danger">Delete</button>
        </div>`
      } else {
        deleteEdit = "";
      }
      quillText.setContents(entry.contents);
      const div = `<div id="journal${entry._id}">
      ${deleteEdit}
      <div class="journal-entry">
      ${quillText.root.innerHTML}
      </div>
      <div class="container messages-container">
        <div data-thread_id=${entry._id} id="topCommentLine">
          <button type="button" class="btn btn-light comment-button">Comment</button>
        </div>
      </div>
      </div>`;
    $('#journals-top').append(div);
  })
  getComments();
} else {
  $('#journals-top').append('<p>No Journals Yet</p>')
}
}


function initTests() {
  Promise.all([
    userSignIn(),
    getComments(),
    getAllCharacters()])
  .then((res) => {
    assignCharacters();
    buildCharacterManagementPage();
    buildAllCharactersPage(allCharacters);
    initCommentClicks();
  }).catch(err => console.log(err))

}

initTests();

function setForUser() {
  assignCharacters();
  buildCharacterManagementPage();
}
