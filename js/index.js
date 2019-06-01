// const url = "http://localhost:5000";
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
let allComments;
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
  const title = target.dataset.page;
  window.history.pushState({}, title, `${window.location.origin}/${title}`);
  $(".main-content").addClass("hidden");
  $(`#${title}Page`).removeClass("hidden");
}

window.onpopstate = () => {
  changePage();
}

function changePage() {
  let page = window.location.pathname.slice(1, window.location.pathname.length)
  if(page===""){
    page="front";
  }
  $(".main-content").addClass("hidden");
  $(`#${page}Page`).removeClass("hidden");
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
    // body: `displayName=HopsTheDog&password=ImaCuteDog`,
    body: `displayName=LarryTheCat&password=ImaStupidCat`,
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
  .then(res => {
    console.log(res)
    return res.json()
  })
  .then(data => uploadImage(file, data.signedRequest, data.url))
  .catch(err=> console.log(err))
};

async function uploadImage(file, signedRequest, iconUrl) {
  return fetch(signedRequest, {
    method: "PUT",
    body: file
  })
  .then((res) => {
    console.log(res);
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
    // buildInputBox(e.target, "mediaComment");
    $(document).off("click", ".comment-button");
    e.target.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      resetCommentClicks();
      $("#inputBox").remove();
    });
  });
  $(document).on("click", ".aye-button", function(e) {
    aye(e);
  });
  $(document).on("click", ".nay-button", function(e) {
    nay(e);
  });
  if(allComments){
    allComments.forEach(x => calculateVotability(x))
  }
}

function aye(e) {
  e.stopImmediatePropagation();
  let comment = findComment(e.target.dataset.forcomment);
  if(comment.votes.hasOwnProperty(postAuthObj.auth_id)) {
    if(comment.votes[postAuthObj.auth_id]===null){
      comment.votes[postAuthObj.auth_id]="aye";
      $(`#${comment._id}-aye`).prop("disabled", true);
    }
    if(comment.votes[postAuthObj.auth_id]==="nay"){
      comment.votes[postAuthObj.auth_id]=null;
      $(`#${comment._id}-nay`).prop("disabled", false);
    }
  } else {
    comment.votes[postAuthObj.auth_id]="aye";
    $(`#${comment._id}-aye`).prop("disabled", true);
  }
  comment.votes.score++;
  updateScore(comment);
}

function nay(e) {
  e.stopImmediatePropagation();
  let comment = findComment(e.target.dataset.forcomment);
  if(comment.votes.hasOwnProperty(postAuthObj.auth_id)) {
    if(comment.votes[postAuthObj.auth_id]===null){
      comment.votes[postAuthObj.auth_id]="nay";
      $(`#${comment._id}-nay`).prop("disabled", true);
    }
    if(comment.votes[postAuthObj.auth_id]==="aye"){
      comment.votes[postAuthObj.auth_id]=null;
      $(`#${comment._id}-aye`).prop("disabled", false);
    }
  } else {
    comment.votes[postAuthObj.auth_id]="nay";
    $(`#${comment._id}-nay`).prop("disabled", true);
  }
  comment.votes.score--;
  updateScore(comment);
}

function updateScore(comment) {
  document.getElementById(`${comment._id}-score`).innerHTML = comment.votes.score;
  sendVotes(comment);
}

function sendVotes(comment) {
  const votes = JSON.stringify(comment.votes)
  fetch(`${url}/comments/${comment._id}`, {
    method: "PATCH",
    body: `votes=${votes}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
}

function findComment(id) {
  let comment =  allComments.filter(obj=> obj._id===id)[0];
  if(comment===undefined) {
    alert("Hmm, you can't seem to do that...");
    return;
  }
  if(comment.votes==undefined){
    comment.votes = {
      score: 0
    }
  }
  return comment;
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
      buildInputBox(target, "mediaComment");
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
      buildComment(data.comment);
    })
    .catch(err => console.log(err));
}

function getComments() {
  fetch(`${url}/comments/get`)
    .then(res => res.json())
    .then(data => {
      allComments = data;
      constructComments(allComments);
    })
    .catch(err => console.log(err));
}

function constructComments(comments) {
  if($(".comment-box").length>0){
    $(".comment-box").remove();
  }
  comments.forEach(comment => {
    const votes = JSON.parse(comment.votes);
    comment.votes = votes;
    buildComment(comment);
  });
}


function buildComment(commentObj) {
  if(!commentObj.votes) {
    commentObj.votes = {
      score: 0
    }
  }
  if(!commentObj.icon){
    commentObj.icon="images/baseDragon.png"
  }

  //comment template using template literal add disabled to comment button
  let comment = `<div class="comment-box mb-1 continer-fluid d-flex">
  <button class="hidePostsButton align-self-start">[-]</button>
  <div class="media pb-1" id="childOf${commentObj.childOf}">
  <img class="mr-3 avatar" src=${commentObj.icon} alt="dragon!">
    <div class="media-body" id=${commentObj._id}>
      <h6 class="mt-0 mb-1">${commentObj.displayName}</h6>
      <p class="mb-1">${commentObj.content}</p>
      <div>
      <span id="${commentObj._id}-score" class="comment-score">${commentObj.votes.score}</span>
        <div class="btn-group comment-vote-buttons" role="group" disabled>
          <button type="button" class="btn-light btn btn-sm mr-1 comment-button">Comment</button>
          <button type="button" id="${commentObj._id}-aye" data-forComment=${commentObj._id} class="btn-light btn btn-sm mr-1 aye-button">Aye!</button>
          <button type="button" id="${commentObj._id}-nay" data-forComment=${commentObj._id} class="btn-light btn btn-sm nay-button">Nay!</button>
        </div>
      </div>
    </div>
  </div>
  </div>`;
  $(`#${commentObj.childOf}`).append(comment);
  initCommentClicks();
}

function calculateVotability(commentObj) {
  if(commentObj.votes) {
    if(commentObj.votes.hasOwnProperty(postAuthObj.auth_id)) {
      if(commentObj.votes[postAuthObj.auth_id]==="aye") {
        $(`#${commentObj._id}-aye`).prop("disabled", true)
      }
      if(commentObj.votes[postAuthObj.auth_id]==="nay") {
        $(`#${commentObj._id}-nay`).prop("disabled", true)
      }
    }
  }
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

function removeEditor() {
  if($('#editor')) {
    $('#editorContainer').empty();
  }
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
  addJournals(false)
  if (editButton !== "") {
    addJournalListener();
    addEditListener();
    addSelectImageListener();
  }
}

function addJournalListener() {
  $("#editJournal").click(e => {
    switchMainContent(e.target)
    addJournals(true);
    $("#openNewJournalEntry").click(e => addJournalEditor(e));
  })
}

function addJournalEditor(e) {
  removeEditor()
  const editor=`<div>
  <div id="editor">
  </div>
  <button id="submitNewJournalEntry" data-page="character">Submit</button>
  </div>`
  $("#editorContainer").append(editor);
  initializeEditor(e);
}

function initializeEditor(e) {
  let journalId;
  quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{header: [1, 2, 3] }],
        ['bold', 'italic', 'underline'],
        ['image'],
      ],
    },
  });
  var toolbar = quill.getModule('toolbar');
  // $("#openNewJournalEntry").off('click');
  toolbar.addHandler('image', function(e) {
    $("#hidden-file-input").trigger("click");
    const fileInput = document.getElementById("hidden-file-input");
    fileInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      selectFile(file, "journal")
      .then(res => {
        quillImageHandler(res);
      })
    })
  })
  if(e.target.id==="openNewJournalEntry"){
    journalId = (Date.now()).toString();
    $("#openNewJournalEntry").text("Cancel");
    $("#openNewJournalEntry").click(() => {
      $("#editorContainer").empty();
      $("#openNewJournalEntry").off("click");
      $("#openNewJournalEntry").text("Add New")
      $("#openNewJournalEntry").click(e => addJournalEditor(e));
    });
  }
  if(e.target.classList.contains("editThisJournal")) {
    journalId = e.target.dataset.target
    console.log(journalId)
    const currentJournal = currentCharacter.journals.filter(x => (x._id.toString()===journalId))[0];
    quill.setContents(currentJournal.contents)
    }
  $("#submitNewJournalEntry").click((e)=> {
    $("#openNewJournalEntry").text("Add New")
    $("#editorContainer").empty();
    //TODO: Edit functions to deal with _id being Date.now()
    addNewJournalEntry(journalId);
    switchMainContent(e.target);
    buildCharacterPage(currentCharacter);
  })
}


function quillImageHandler(fileURL) {
  var range = quill.getSelection();
    if(fileURL){
      quill.insertEmbed(range.index, 'image', fileURL, Quill.sources.USER);
    }
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


function addNewJournalEntry(journalId) {
  console.log(journalId)
  let contents = quill.getContents();
  let entry = {
    _id: journalId,
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
  fileInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    selectFile(file, type);
    $("#icon-modal").modal("toggle")
  }, false)
}

async function selectFile(file, type) {
  console.log(file);
  return compressImage(file)
  .then(newFile => getSignedRequest(newFile))
  .then(res => {
    if(type==="character"){
      updateCharacter(res, "icon");
    }
    if(type==="user") {
      updateUserAvatar(res);
    }
    if(type==="journal") {
      return res;
    }
  })
}
//titled compress but also runs the image rotation modal
async function compressImage(file) {
  return new Promise(function(res, rej) {
  if($('canvas')) {
    $('canvas').remove()
  }
  let width = 512;
  const fileName = file.name;
  const fileType = file.type;
  const reader = new FileReader();
  const canvas = document.createElement('canvas');
  reader.readAsDataURL(file);
  reader.onload = event => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      if(img.height > img.width) {
        width = (img.width/img.height)*512;
      }
      const scaleFactor = width/img.width;
      canvas.width = width;
      canvas.height = img.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const wh = Math.sqrt(canvas.width**2 + canvas.height**2)
      const imgWidth = width;
      const imgHeight = canvas.height;
      const originX = (wh-width)/2
      const originY = (wh-imgHeight)/2
      canvas.width = wh;
      canvas.height= wh;
      ctx.drawImage(img, originX, originY, imgWidth, imgHeight);
      ctx.arc(wh/2, wh/2, wh/4, 0, 0)
      $('#editImageContainer').append(canvas);
      $('#image-edit-modal').modal('toggle');
      $('#rotateRight').click(function() {
        ctx.clearRect(0, 0, wh, wh)
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(45 * Math.PI / 180);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        ctx.drawImage(img, originX, originY, imgWidth, imgHeight);
      })
      $('#rotateLeft').click(function() {
        ctx.clearRect(0, 0, wh, wh)
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(-45 * Math.PI / 180);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        ctx.drawImage(img, originX, originY, imgWidth, imgHeight);
      })
      $('#imageReadyButton').click(() => {
        $('#imageReadyButton').off('click')
        $('canvas').remove()
        $('#image-edit-modal').modal('toggle');
        ctx.canvas.toBlob((blob) => {
          const newFile = new File([blob], fileName, {
            type: fileType,
            lastModified: Date.now()
          });
        res(newFile)
      }, fileType, 1)
        })
      }
  }
})
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

function addJournals(owner) {
  let topDiv = owner ? '#thisCharactersJournals':'#journals-top';
  $('#thisCharactersJournals').empty();
  $('#journals-top').empty();
  if(currentCharacter.journals){
    const journalDivs = currentCharacter.journals.forEach(entry => {
      if(!entry._id){
        entry._id=`${Date.now()}error`;
        console.log("missing id");
      }
      let quillText = new Quill(document.createElement("div"));
      let deleteEdit;
      if(owner===true){
        deleteEdit = `<div class="mt-1 button-group">
        <button id="${entry._id}edit" data-target=${entry._id} type="button" class="btn btn-warning editThisJournal">Edit</button>
        <button id="${entry._id}delete" data-target=${entry._id} type="button" class="btn btn-danger deleteThisJournal">Delete</button>
        </div>`;
      } else {
        deleteEdit = "";
      }
      quillText.setContents(entry.contents);
      const div = `<div id="journal-${entry._id.toString()}">
      <div>
      ${deleteEdit}
      <div class="row mx-auto journal-entry">
      ${quillText.root.innerHTML}
      </div>
      <div class="container messages-container">
        <div data-thread_id=${entry._id} id="topCommentLine">
          <button type="button" class="btn btn-light comment-button">Comment</button>
        </div>
      </div>
      </div>
      </div>`;
    $(topDiv).append(div);
  })
  $("img").addClass('img-fluid mx-auto');
  if(owner===true){
    addJournalManagement()
  }
  getComments();
} else {
  $(topDiv).append('<p>No Journals Yet</p>')
}
}

function addJournalManagement() {
  $(".deleteThisJournal").click(e => deleteJournal(e.target))
  $(".editThisJournal").click(e => addJournalEditor(e))
}


function deleteJournal(target) {
  const journalId = target.dataset.target;
  console.log(journalId)
  if(confirm("Are you sure you want to delete this journal?")){
    return fetch(`${url}/characters/delete-journal`, {
      method: "PUT",
      body: `character_id=${currentCharacter._id}&journal_id=${journalId}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(res => res.json())
    .then(data => {
      if(data.message==="journal deleted"){
        const newJournals = currentCharacter.journals.filter(journal => journal._id.toString() !== data.journal_id.toString());
        currentCharacter.journals = newJournals;
        addJournals(true);
      }
    })
    .catch(err =>console.log(err))
  }else{
    return;
  };
}

function setForUser() {
  assignCharacters();
  buildCharacterManagementPage();
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
