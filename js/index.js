(function() {
  // const url = "http://localhost:5000";
  const url = "https://pacific-headland-65956.herokuapp.com";
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
  let userIconObj = {};
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
    auth_id: ""
  };
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

  const getUserIconObj = () => {
    return fetch(`${url}/users/user_icon_object/`)
      .then(res => res.json())
      .then(data => {
        userIconObj = data.body
      })
      .catch(err => console.log(err))
  }

  const hideCommentOverflow = () => {
    const windowWidth = window.innerWidth;
    $('.comment-content').each(function() {
      const offset = $(this).offset()
      const width = $(this).width()
      const buttonsBox = $(this).next().children(".btn-group")
      const buttonsBoxWidth = buttonsBox.width()
      const buttonsBoxOffset = buttonsBox.offset()
      const buttonsBoxEdge = buttonsBoxOffset.left + buttonsBoxWidth
      const contentEdge = offset.left + width
      const edge = buttonsBoxEdge > contentEdge ? buttonsBoxEdge : contentEdge;
      const target = $(this).closest(".media").prev()
      if (edge > windowWidth * .95) {
        target.each(function() {
          this.innerHTML = '[+]';
          this.nextElementSibling.classList.add("hidden");
        })
      } else if (edge < windowWidth * .95) {
        target.each(function() {
          this.innerHTML = '[-]';
          this.nextElementSibling.classList.remove("hidden");
        })
      }
    });
  }

  window.onresize = hideCommentOverflow;

  const imgError = image => {
    image.onerror = "";
    image.src = "images/dragonImageNotFound.png";
    return true;
  }
  window.imgError = imgError
  newUserButton.addEventListener("click", () => toggleSignInForm());

  $("#character-search-input").on("input", function(e) {
    filterAllCharactersBy(e.target.value);
  });

  $("#allGoodCheck").click(e => {
    e.target.checked ?
      $("#characterSubmitButton").removeAttr("disabled") :
      $("#characterSubmitButton").attr("disabled", true);
  });

  $("#addCharacterButton").click(e => switchMainContent(e.target));

  $("#addCharacterForm").submit(e => {
    e.preventDefault();
    addCharacter();
  });

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
  };

  function changePage() {
    let page = window.location.pathname.slice(
      1,
      window.location.pathname.length
    );
    if (page === "") {
      page = "front";
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

  function getAllCharacters() {
    return fetch(`${url}/characters/get`)
      .then(res => res.json())
      .then(data => {
        allCharacters = data.body
        allCharacters.forEach(x => userIconObj[x.name] = x.icon)
        return allCharacters
      })
      .catch(err => console.log(err));
  }

  function userSignIn() {
    return fetch(`${url}/users/login/`, {
        method: "POST",
        body: `displayName=${displayName.value}&password=${password.value}`,
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
            auth_id: user._id
          };
          $("#sign-in-modal").modal("toggle");
          //basic setup on login
          setForUser();
          return false;
        } else {
          $("#signInAlert").text(data.message);
          $("#signInAlert").removeAttr("hidden");
        }
      });
  }

  function addUser() {
    return fetch(`${url}/users/create/`, {
        method: "POST",
        body: `displayName=${displayName.value}&password=${
        password.value
      }&email=${email.value}&passwordMatch=${passwordMatch.value}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.message === "success") {
          user = data.user;
          $("#sign-in-modal").modal("toggle");
          //basic setup on login
          setForUser();
          return false;
        } else {
          if (!data.displayName) {
            data.displayName = "";
          }
          if (!data.email) {
            data.email = "";
          }
          if (!data.password) {
            data.password = "";
          }
          if (!data.passwordMatch) {
            data.passwordMatch = "";
          }
          const errorMessage = `${data.displayName}
          ${data.email}
          ${data.password}
          ${data.passwordMatch}`;
          $("#signInAlert").text(errorMessage);
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
    return fetch(`${url}/characters/create/`, {
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
        $("#addCharacterPage").addClass("hidden");
        $("#characterManagementPage").removeClass("hidden");
      })
      .catch(err => console.log(err));
  }

  function getSignedRequest(file) {
    return fetch(`${url}/sign-s3?file-name=${file.name}&file-type=${file.type}`)
      .then(res => res.json())
      .then(data => uploadImage(file, data.signedRequest, data.url))
      .catch(err => console.log(err));
  }

  function uploadImage(file, signedRequest, iconUrl) {
    return fetch(signedRequest, {
        method: "PUT",
        body: file
      })
      .then(res => {
        console.log(res);
        return iconUrl;
      })
      .catch(err => console.log(err));
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
    if (input !== "") {
      filteredList = allCharacters.filter(x => {
        if (x.name.toLowerCase().includes(input.toLowerCase())) {
          return x;
        }
      });
      filteredList.sort(function(a, b) {
        return (
          a.name.toLowerCase().indexOf(input.toLowerCase()) -
          b.name.toLowerCase().indexOf(input.toLowerCase())
        );
      });
    }
    buildAllCharactersPage(filteredList);
  }

  function initCommentClicks() {
    initCommentCollapsers();
    $(document).on("click", ".comment-button", e => {
      e.stopImmediatePropagation();
      if (!user.displayName) {
        alert("you must be logged in to do that!");
        return;
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
    if (allComments) {
      allComments.forEach(x => calculateVotability(x));
    }
    hideCommentOverflow();
  }

  function aye(e) {
    e.stopImmediatePropagation();
    let comment = findComment(e.target.dataset.forcomment);
    if (comment.votes.hasOwnProperty(postAuthObj.auth_id)) {
      if (comment.votes[postAuthObj.auth_id] === null) {
        comment.votes[postAuthObj.auth_id] = "aye";
        $(`#${comment._id}-aye`).prop("disabled", true);
      }
      if (comment.votes[postAuthObj.auth_id] === "nay") {
        comment.votes[postAuthObj.auth_id] = null;
        $(`#${comment._id}-nay`).prop("disabled", false);
      }
    } else {
      comment.votes[postAuthObj.auth_id] = "aye";
      $(`#${comment._id}-aye`).prop("disabled", true);
    }
    comment.votes.score++;
    updateScore(comment);
  }

  function nay(e) {
    e.stopImmediatePropagation();
    let comment = findComment(e.target.dataset.forcomment);
    if (comment.votes.hasOwnProperty(postAuthObj.auth_id)) {
      if (comment.votes[postAuthObj.auth_id] === null) {
        comment.votes[postAuthObj.auth_id] = "nay";
        $(`#${comment._id}-nay`).prop("disabled", true);
      }
      if (comment.votes[postAuthObj.auth_id] === "aye") {
        comment.votes[postAuthObj.auth_id] = null;
        $(`#${comment._id}-aye`).prop("disabled", false);
      }
    } else {
      comment.votes[postAuthObj.auth_id] = "nay";
      $(`#${comment._id}-nay`).prop("disabled", true);
    }
    comment.votes.score--;
    updateScore(comment);
  }

  function updateScore(comment) {
    document.getElementById(`${comment._id}-score`).innerHTML =
      comment.votes.score;
    sendVotes(comment);
  }

  function sendVotes(comment) {
    const votes = JSON.stringify(comment.votes);
    return fetch(`${url}/comments/${comment._id}`, {
        method: "PATCH",
        body: `votes=${votes}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(res => res.json())
      .then(data => console.log(data));
  }

  function findComment(id) {
    let comment = allComments.filter(obj => obj._id === id)[0];
    if (comment === undefined) {
      alert("Hmm, you can't seem to do that...");
      return;
    }
    if (comment.votes == undefined) {
      comment.votes = {
        score: 0
      };
    }
    return comment;
  }

  function addSelectorDropdown(target) {
    const authorList = userCharacters.slice(0, userCharacters.length);
    authorList.unshift(user);
    const nameList = buildElement("name-list", "div");
    nameList.classList.add("dropdown-menu");
    authorList.forEach(x => {
      if (x.displayName) {
        x.name = x.displayName;
      }
      const item = buildElement(x.name, "a");
      item.classList.add("dropdown-item");
      item.innerHTML = x.name;
      nameList.append(item);
      item.addEventListener("click", e => {
        e.stopImmediatePropagation();
        postAuthObj.auth_id = x._id;
        postAuthObj.name = x.name;
        postAuthObj.icon = x.icon;
        nameList.remove();
        buildInputBox(target, "mediaComment");
      });
    });
    nameList.style.display = "block";
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
    inputBox.classList.add("container", "d-flex");
    textInput.setAttribute("cols", "40");
    textInput.setAttribute("rows", "4");
    inputBox.append(textInput);
    if (type === "mediaComment") {
      const postButton = buildElement("postButton", "button");
      const mediaAncestor = parentDiv.parentElement.parentElement;
      postButton.classList.add("btn", "shadow", "btn-sm", "btn-light", "mb-1");
      postButton.innerHTML = "Post";
      inputBox.append(postButton);
      parentDiv.before(inputBox);
      $(postButton).click(e => {
        sendPost(textInput.value, user.displayName, mediaAncestor);
        $("#inputBox").remove();
      });
    }
    if (type === "characterSummary") {
      const updateSummaryButton = buildElement("updateSummaryButton", "button");
      updateSummaryButton.classList.add("btn", "shadow", "mt-1", "btn-sm", "btn-light");
      updateSummaryButton.innerHTML = "Update";
      inputBox.append(updateSummaryButton);
      const presentSummary = $("#characterSummary").text();
      textInput.value = presentSummary;
      $("#characterSummary").after(inputBox);
      $(updateSummaryButton).click(e => {
        updateCharacter(textInput.value, "summary");
        $("#inputBox").remove();
      });
    }
  }

  function sendPost(content, displayName, parentDiv) {
    const data = {
      displayName: displayName,
      content: content,
      childOf: parentDiv.id,
      icon: postAuthObj.icon
    };
    return fetch(`${url}/comments/add/`, {
        method: "POST",
        body: `auth_id=${postAuthObj.auth_id}&displayName=${
        postAuthObj.name
      }&content=${content}&childOf=${parentDiv.id}&icon=${postAuthObj.icon}`,

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
    return fetch(`${url}/comments/get`)
      .then(res => res.json())
      .then(data => {
        allComments = data;
        return data;
        // constructComments(allComments);
      })
      .catch(err => console.log(err));
  }

  function constructComments(comments) {
    if ($(".comment-box").length > 0) {
      $(".comment-box").remove();
    }
    comments.forEach(comment => {
      // TO-CLEAN on standardization
      console.log(typeof(comment.votes))
      if (typeof(comment.votes) === "string") {
        const votes = JSON.parse(comment.votes);
        comment.votes = votes;
      }
      buildComment(comment);
    });
    initCommentClicks();
  }

  function buildComment(commentObj) {
    if (!commentObj.votes.score) {
      commentObj.votes = {
        score: 0
      };
    }
    icon = userIconObj[commentObj.displayName]
    if (icon == undefined) {
      commentObj.icon = "images/baseDragon.png";
    }

    //comment template using template literal
    let comment = `<div class="comment-box px-0 my-2 pb-1 container-fluid d-flex">
  <button class="hidePostsButton align-self-start">[-]</button>
  <div class="media pb-1" id="childOf${commentObj.childOf}">
  <img class="mr-3 avatar" src=${icon} alt="dragon!">
    <div class="media-body" id=${commentObj._id}>
      <h6 class="mt-0 mb-1">${commentObj.displayName}</h6>
      <p class="mb-1 comment-content">${commentObj.content}</p>
      <div>
      <span id="${commentObj._id}-score" class="comment-score">${
      commentObj.votes.score
    }</span>
        <div class="btn-group comment-vote-buttons" role="group" disabled>
          <button type="button" class="btn-light btn shadow btn-sm mr-1 comment-button">Comment</button>
          <button type="button" id="${commentObj._id}-aye" data-forComment=${
      commentObj._id
    } class="btn-light btn shadow btn-sm mr-1 aye-button">Aye!</button>
          <button type="button" id="${commentObj._id}-nay" data-forComment=${
      commentObj._id
    } class="btn-light btn shadow btn-sm nay-button">Nay!</button>
        </div>
      </div>
    </div>
  </div>
  </div>`;
    $(`#${commentObj.childOf}`).append(comment);
  }

  function calculateVotability(commentObj) {
    if (commentObj.votes) {
      if (commentObj.votes.hasOwnProperty(postAuthObj.auth_id)) {
        if (commentObj.votes[postAuthObj.auth_id] === "aye") {
          $(`#${commentObj._id}-aye`).prop("disabled", true);
        }
        if (commentObj.votes[postAuthObj.auth_id] === "nay") {
          $(`#${commentObj._id}-nay`).prop("disabled", true);
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
    if (document.getElementById("characterManagementIconColumn")) {
      $("#characterManagementIconColumn").remove();
    }
    $("#characterPageHeader").before(
      `<div id="characterManagementIconColumn" class="col-3"><button data-target="#icon-modal" data-toggle="modal" class="btn btn-primary shadow btn-outline mb-2 mt-0">Choose Avatar</button><img id="user-icon" class="img-fluid mb-2" src=${
        user.icon
      } alt="user-icon"/></div>`
    );
    $("#characterList")
      .children()
      .remove();
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
    if (characterObj.icon == undefined) {
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
    if ($("#editor")) {
      $("#editorContainer").empty();
    }
  }

  function selectCharacter(target) {
    currentCharacter = allCharacters.filter(char => char._id === target.id)[0];
    buildCharacterPage(currentCharacter);
    switchMainContent(target);
  }


  function buildCarouselItems() {
    let returnString = ''
    if (!currentCharacter.carousel) {

      const returnString = `
      <div class="card">
      <div class="card-body d-none d-md-block">
      <img src="images/baseDragon.png" class="d-block mx-auto w-100" alt="hammer!">
      <h5 class="card-text">No Items Added Yet</h5>
      <p class="card-text"></p>
      </div>
      </div>`

    } else {
      currentCharacter.carousel.forEach(obj => {
        if (typeof(obj) === "string") {
          obj = JSON.parse(obj)
        }
        const carouselString = `
      <div data-target=${obj._id} class="item carousel-card mx-auto">
      <div class="card">
      <div class="card-body d-block">
      <img src="${obj.img}" class="d-block w-100" alt="hammer!">
      <h5 class="card-text">${obj.headline}</h5>
      <p class="card-text">${obj.captionBody}</p>
      </div>
      </div>
      </div>`
        returnString += carouselString;
      })
    }
    return returnString;
  }

  $("#carousel-modal").on("hide.bd.modal", function(e) {
    console.log(e);
    $("#carouselEditorBox").children().remove()
    $("#carouselSubmitButton").toggleClass('d-none');
    $("#defaultCarouselFooterButtons").toggleClass('d-none');
  })

  function buildCarousel() {
    let carousel
    let editCarouselButton = "";
    let carouselItems = buildCarouselItems();
    if (
      userCharacters.filter(x => x._id === currentCharacter._id).length !== 0
    ) {

      editCarouselButton = `<div class="row"><button
      data-char_id=${currentCharacter._id}
       class='btn btn-primary shadow mb-4 mx-auto mt-1' id='editCarouselButton'>
       Edit Carousel Images</button></div>`
    }
    return carousel = `${editCarouselButton}<div class='owl-carousel owl-theme'>${carouselItems}</div>`

  }


  function buildCharacterPage(currentCharacter) {
    $("#characterPageJumbo").empty();
    const carousel = buildCarousel()
    let journalUpdateButton = "";
    let editButton = "";
    let switchImageButton = "";
    let summary = "No summary yet";
    if (currentCharacter.summary) {
      summary = currentCharacter.summary;
    }
    if (
      userCharacters.filter(x => x._id === currentCharacter._id).length !== 0
    ) {

      editButton = `<button data-char_id=${
        currentCharacter._id
      } id='editCharacterSummaryButton'class='btn btn-primary shadow mb-4 ml-3 mt-1'>Edit Summary</button>`;
      switchImageButton = `<button data-char_id=${
        currentCharacter._id
      } id='chooseCharacterImageButton' data-target="#icon-modal" data-toggle="modal" class='btn btn-primary shadow btn-outline mt-0'>Choose Image</button>`;
      journalUpdateButton = `<button id="editJournal" class="btn mt-2 btn-primary shadow" data-page="journalEditor">Edit Journals</button>`;
    } else {
      editButton = "";
    }
    const charInfo = `<div class="container">
    <div class="row">
    <div class="col">
    ${carousel}
    </div>
    </div>
  <div class="row mt-2">
  <div class="col-2 pl-0">
  ${switchImageButton}
  <img class="character-image img-thumbnail mr-2" src="${currentCharacter.icon}">
  </div>
  <div class="col-5 ml-auto border-light pt-1 card char-card">
  <h5 class="card-title">${currentCharacter.name}</h5>
  <h6 class="card-subtitle mb-2">Race: ${currentCharacter.race}</h6>
  <h6 class="card-subtitle mb-2">Class: ${currentCharacter.class}</h6>
  </div>
  </div>
  <div class="row">
    <h5 class="mb-0 mt-1">Summary</h5>${editButton}
  </div>
  <p id="characterSummary">${summary}</p>
  ${journalUpdateButton}
  <h1 class="title">Journals</h1>
  <div id="journals-top"></div>
  </div>`;
    $("#characterPageJumbo").append(charInfo);
    addJournals(false);
    if (editButton !== "") {
      addJournalListener();
      addEditListener();
      addSelectImageListener();
      addEditCarouselListener();
    }
  }

  function addEditCarouselListener() {
    $("#editCarouselButton").click(e => {
      $("#carousel-modal").modal('show')
      setEditCarouselModalContent()
    })
  }

  function setEditCarouselModalContent() {
    $("#carouselEditorBox").empty()
    if (!currentCharacter.carousel) {
      $("#carouselEditorBox").text("No Slides Yet, Add Some!")
    } else {
      let items = buildCarouselItems()
      $("#carouselEditorBox").append(items);
      ($("#carouselEditorBox").children().each(function(i) {
        $(this).removeClass('mx-auto');
        $(this).addClass('m-2')
      }))
    }
    $("#deleteCarouselSlide").click((e) => {
      e.stopImmediatePropagation();
      $("#carouselEditModalHeader").text("Select a slide to delete.")
      $(".carousel-card").children(".card").toggleClass('highlight-delete');
      $(".carousel-card").click(e => {
        let target = e.currentTarget;
        $(".carousel-card").children(".card").toggleClass('highlight-delete');
        $("#carouselEditModalHeader").text("Edit Your Carousel")
        // console.log(e)
        // const slideId = await selectSlide()
        deleteJournalOrCarousel(target, "carousel")
          .then(x => {
            $(".carousel-card").off("click");
            setEditCarouselModalContent();
          })
      })
    })
    $("#editCarouselSlide").click(() => {})
    $("#addCarouselSlide").click(() => {
      let carouselSlide = {}
      $("#addCarouselSlide").off("click")
      newCarouselSlide(carouselSlide)
    })
  }



  function newCarouselSlide(carouselSlide) {
    $("#hiddenFileInput").trigger("click");
    $("#carousel-modal").modal('hide')
    const fileInput = document.getElementById("hiddenFileInput");
    fileInput.addEventListener("change", async function(e) {
      e.stopImmediatePropagation();
      const file = e.target.files[0];
      const correctedImage = await compressImage(file)
      getSignedRequest(correctedImage).then((res) => {
        console.log(res)
        carouselSlide.img = res
        $("#carouselEditorBox").text("")
        openCarouselSlideEditor(carouselSlide);
      })
    })
  }


  function openCarouselSlideEditor(carouselSlide) {
    $("#carouselEditorBox").empty()
    $("#carouselEditorBox").removeClass("d-flex")
    $("#carousel-modal").modal('show');
    $("#defaultCarouselFooterButtons").toggleClass('d-none');
    $("#carouselEditorBox").append(`<div class="row">
      <img class="img-fluid mx-auto mt-2" src="${carouselSlide.img}" />`)
    const carouselTextInput = `<div class="container">
    <div class="row my-2">
    <label class="mr-2 my-auto" for="headline">Headline
    </label>
    <input id="headline" type="text">
     </input>
     </div>
     <div class="row my-1">
     <label class="mr-3 my-auto" for="captionBody">Caption</label>
     <textarea id="captionBody"></textarea>
     </div>
     </div>`
    $("#carouselEditorBox").append(carouselTextInput)
    $("#carouselSubmitButton").toggleClass('d-none');
    if (!carouselSlide._id) {
      carouselSlide._id = Date.now()
    } else {
      $("#captionBody").text(carouselSlide.captionBody);
      $("#headline").text(carouselSlide.headline);
    }
    $("#carouselSubmitButton").click(function() {
      $("#carouselSubmitButton").toggleClass('d-none');
      $("#defaultCarouselFooterButtons").toggleClass('d-none');
      carouselSlide.captionBody = $("#captionBody").val();
      carouselSlide.headline = $("#headline").val();
      console.log(carouselSlide);
      const carouselSlideString = JSON.stringify(carouselSlide)
      $("#carousel-modal").modal('hide')
      $("#carouselEditorBox").addClass("d-flex")
      $("#captionBody").text("")
      $("#headline").text("")
      // $("#carouselEditorBox").empty()
      return updateCharacter(carouselSlideString, "carousel")
        .then(res => console.log(res))
    })
  }

  function addJournalListener() {
    $("#editJournal").click(e => {
      switchMainContent(e.target);
      addJournals(true);
      $("#openNewJournalEntry").click(e => addJournalEditor(e));
    });
  }

  function addJournalEditor(e) {
    removeEditor();
    const editor = `<div>
  <div id="editor">
  </div>
  <button id="submitNewJournalEntry" data-page="character">Submit</button>
  </div>`;
    $("#editorContainer").append(editor);
    initializeEditor(e);
  }

  function initializeEditor(e) {
    let journalId;
    quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: [
          [{
            header: [1, 2, 3]
          }],
          ["bold", "italic", "underline"],
          ["image"]
        ]
      }
    });
    var toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", function(e) {
      $("#hiddenFileInput").trigger("click");
      const fileInput = document.getElementById("hiddenFileInput");
      fileInput.addEventListener("change", function(e) {
        e.stopImmediatePropagation();
        const file = e.target.files[0];
        selectFile(file, "journal").then(res => {
          quillImageHandler(res);
        });
      });
    });
    if (e.target.id === "openNewJournalEntry") {
      journalId = Date.now().toString();
      $("#openNewJournalEntry").text("Cancel");
      $("#openNewJournalEntry").click(() => {
        $("#editorContainer").empty();
        $("#openNewJournalEntry").off("click");
        $("#openNewJournalEntry").text("Add New");
        $("#openNewJournalEntry").click(e => addJournalEditor(e));
      });
    }
    if (e.target.classList.contains("editThisJournal")) {
      journalId = e.target.dataset.target;
      console.log(journalId);
      const currentJournal = currentCharacter.journals.filter(
        x => x._id.toString() === journalId
      )[0];
      quill.setContents(currentJournal.contents);
    }
    $("#submitNewJournalEntry").click(e => {
      $("#openNewJournalEntry").text("Add New");
      $("#editorContainer").empty();
      //TODO: Edit functions to deal with _id being Date.now()
      addNewJournalEntry(journalId);
      switchMainContent(e.target);
      buildCharacterPage(currentCharacter);
    });
  }

  function quillImageHandler(fileURL) {
    var range = quill.getSelection();
    if (fileURL) {
      quill.insertEmbed(range.index, "image", fileURL, Quill.sources.USER);
    }
    $('img').addClass('img-fluid mx-auto')
  }

  function buildAllCharactersPage(characters) {
    if ($("#allCharactersList").children()) {
      $("#allCharactersList")
        .children()
        .remove();
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
      $("#editCharacterSummary").off("click")
      $("#editCharacterSummaryButton").click(e => {
        e.stopImmediatePropagation()
        document.querySelector("#inputBox").remove()
        $("#editCharacterSummary").off("click")
        addEditListener()
      })
    });
  }

  function populateIconModal(type) {
    $("#iconsBox")
      .children()
      .remove();
    iconsArray.forEach(x => {
      const iconButton = buildElement(x, "button");
      iconButton.classList.add("btn", "icon-button");
      iconButton.innerHTML = `<img data-target="#icon-modal" data-toggle="modal" class='icon-select-image' src='images/${x}.png'>`;
      $("#iconsBox").append(iconButton);
      iconButton.addEventListener("click", () => {
        if (type === "character") {
          updateCharacter(`images/${x}.png`, "icon");
        }
        if (type === "user") {
          updateUserAvatar(`images/${x}.png`);
        }
      });
    });
    $("#iconsBox")
      .append(`<form enctype="multipart/form-data" class='btn icon-button d-flex'><label for="avatar">Choose your own</label>
    <input class="mb-1 btn btn-file" type="file" id="icon-file-pick" name="avatar" accept="image/png, image/jpeg"></form>`);
    const fileInput = document.getElementById("icon-file-pick");
    fileInput.addEventListener(
      "change",
      function(e) {
        const file = e.target.files[0];
        selectFile(file, type);
        $("#icon-modal").modal("toggle");
      },
      false
    );
  }

  async function selectFile(file, type) {
    return compressImage(file)
      .then(newFile => getSignedRequest(newFile))
      .then(res => {
        if (type === "character") {
          updateCharacter(res, "icon");
        }
        if (type === "user") {
          updateUserAvatar(res);
        }
        if (type === "journal") {
          return res;
        }
      });
  }
  //titled compress but also runs the image rotation modal
  async function compressImage(file) {
    $("#editImageContainer").empty();
    return new Promise(function(res, rej) {
      let width = 768;
      const fileName = file.name;
      const fileType = file.type;
      const reader = new FileReader();
      let canvas;
      if (document.querySelector("canvas")) {
        canvas = document.querySelector("canvas");
      } else {
        canvas = document.createElement("canvas");
      }
      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          if (img.height > img.width) {
            width = (img.width / img.height) * 768;
          }
          const scaleFactor = width / img.width;
          const imgWidth = width;
          const imgHeight = img.height * scaleFactor;
          var ctx = canvas.getContext("2d");
          const wh = Math.sqrt(imgWidth ** 2 + imgHeight ** 2);
          const originX = (wh - width) / 2;
          const originY = (wh - imgHeight) / 2;
          canvas.width = wh;
          canvas.height = wh;
          ctx.drawImage(img, originX, originY, imgWidth, imgHeight);
          $("#editImageContainer").append(canvas);
          $("#image-edit-modal").modal("show");
          let rotation = 0;
          $("#rotateRight").click(function(e) {
            e.stopImmediatePropagation()
            rotation += 45;
            if (rotation === 180) {
              rotation = 0;
            }
            rotateImage(45)
          });
          $("#rotateLeft").click(function(e) {
            e.stopImmediatePropagation()
            rotation -= 45;
            if (rotation === -180) {
              rotation = 0;
            }
            rotateImage(-45);
          });

          function rotateImage(x) {
            ctx.clearRect(0, 0, wh, wh);
            ctx.fillStyle = 'transparent'
            ctx.fillRect(0, 0, wh, wh);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((x * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(img, originX, originY, imgWidth, imgHeight);
            if (rotation === 0 || rotation === 90) {
              trimImage(ctx, canvas, rotation, wh, imgWidth, imgHeight)
            }

          }

          $("#imageReadyButton").click(() => {
            let canvasToBlob = ctx.canvas;
            if (rotation === 0 || rotation === 90) {
              canvasToBlob = trimImage(ctx, canvas, rotation, wh, imgWidth, imgHeight)
            }
            $("#editImageContainer").empty();
            $("#rotateLeft").off('click');
            $("#rotateRight").off('click')
            $("#imageReadyButton").off("click");
            $("#image-edit-modal").modal("hide");
            canvasToBlob.toBlob(
              blob => {
                const newFile = new File([blob], fileName, {
                  type: fileType,
                  lastModified: Date.now()
                });
                res(newFile);
              },
              fileType,
              1
            );
          });
        };
      };
    });
  }

  function trimImage(ctx, canvas, rotation, wh, imgWidth, imgHeight) {
    const copy = document.createElement('canvas').getContext('2d');
    if (rotation === 90) {
      const topY = (wh - imgWidth) / 2
      const topX = (wh - imgHeight) / 2
      copy.canvas.width = imgHeight;
      copy.canvas.height = imgWidth;
      const trimmed = ctx.getImageData(topX, topY, imgHeight, imgWidth)
      copy.putImageData(trimmed, 0, 0)
      return copy.canvas;
    } else {
      const topY = (wh - imgHeight) / 2
      const topX = (wh - imgWidth) / 2
      copy.canvas.width = imgWidth;
      copy.canvas.height = imgHeight;
      const trimmed = ctx.getImageData(topX, topY, imgWidth, imgHeight)
      copy.putImageData(trimmed, 0, 0)
      return copy.canvas;
    }
  }

  $("#image-edit-modal").on("hide.bs.modal", () =>
    $("#editImageContainer").empty()
  );

  function updateUserAvatar(iconUrl) {
    return fetch(`${url}/users/${user._id}/image`, {
        method: "POST",
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
      .catch(err => console.log(err));
  }

  function updateCharacter(content, type) {
    return fetch(`${url}/characters/${currentCharacter._id}/update`, {
        method: "PUT",
        body: `type=${type}&content=${content}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(res => res.json())
      .then(data => {
        allCharacters.push(data.body);
        currentCharacter = data.body;
        buildCharacterPage(currentCharacter)
        return currentCharacter;
      })
      .catch(err => console.log(err));
  }

  function assignCharacters() {
    userCharacters = [];
    for (let i = 0; i < user.characters.length; i++) {
      for (let j = 0; j < allCharacters.length; j++) {
        if (user.characters[i] === allCharacters[j]._id) {
          userCharacters.push(allCharacters[j]);
        }
      }
    }
  }

  function addJournals(owner) {
    let topDiv = owner ? "#thisCharactersJournals" : "#journals-top";
    $("#thisCharactersJournals").empty();
    $("#journals-top").empty();
    if (currentCharacter.journals.length > 0) {
      const journalDivs = currentCharacter.journals.forEach(entry => {
        if (!entry._id) {
          entry._id = `${Date.now()}error`;
          console.log("missing id");
        }
        let quillText = new Quill(document.createElement("div"));
        let deleteEdit;
        if (owner === true) {
          deleteEdit = `<div class="mt-1 button-group">
        <button id="${entry._id}edit" data-target=${
            entry._id
          } type="button" class="btn shadow btn-warning m-1 editThisJournal">Edit</button>
        <button id="${entry._id}delete" data-target=${
            entry._id
          } type="button" class="btn shadow btn-danger m-1 deleteThisJournal">Delete</button>
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
          <button type="button" class="btn shadow btn-light comment-button">Comment</button>
        </div>
      </div>
      </div>
      </div>`;
        $(topDiv).append(div);
      });
      $("img").addClass("img-fluid mx-auto");
      if (owner === true) {
        addJournalManagement();
      }
      getComments()
        .then(res => constructComments(allComments));
    } else {
      $(topDiv).append("<p>No Journals Yet</p>");
    }
  }

  function addJournalManagement() {
    $(".deleteThisJournal").click(e => deleteJournalOrCarousel(e.target, "journals"));
    $(".editThisJournal").click(e => addJournalEditor(e));
  }

  function deleteJournalOrCarousel(target, type) {
    const journalId = target.dataset.target;
    const typeText = (type === "carousel" ? "carousel slide" : "journal")
    if (confirm(`Are you sure you want to delete this ${typeText}?`)) {
      return fetch(`${url}/characters/delete-journal-or-carousel`, {
          method: "PUT",
          body: `character_id=${currentCharacter._id}&journal_or_carousel_id=${journalId}&type=${type}`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.message === `${type} deleted`) {
            console.log(data)
            currentCharacter = data.character

            console.log(currentCharacter)
            if (type === "journals") {
              addJournals(true);
            }
            if (type === "carousel") {
              buildCarousel()
            }
          }
        })
        .catch(err => console.log(err));
    } else {
      return;
    }
  }

  function setForUser() {
    assignCharacters();
    buildCharacterManagementPage();
  }

  function initTests() {
    Promise.all([
        getUserIconObj(),
        getAllCharacters(),
        getComments()
      ])
      .then(res => {
        buildAllCharactersPage(allCharacters);
        constructComments(allComments)
      })
      .catch(err => console.log(err));
  }


  initTests()
})();



(function(win) {
  'use strict';

  var listeners = [],
    doc = win.document,
    MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
    observer;

  function ready(selector, fn) {
    // Store the selector and callback to be monitored
    listeners.push({
      selector: selector,
      fn: fn
    });
    if (!observer) {
      // Watch for changes in the document
      observer = new MutationObserver(check);
      observer.observe(doc.documentElement, {
        childList: true,
        subtree: true
      });
    }
    // Check if the element is currently in the DOM
    check();
  }

  function check() {
    // Check the DOM for elements matching a stored selector
    for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
      listener = listeners[i];
      // Query for elements matching the specified selector
      elements = doc.querySelectorAll(listener.selector);
      for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
        element = elements[j];
        // Make sure the callback isn't invoked with the
        // same element more than once
        if (!element.ready) {
          element.ready = true;
          // Invoke the callback with the element
          listener.fn.call(element, element);
        }
      }
    }
  }

  // Expose `ready`
  win.ready = ready;

})(this);

ready('img', function(element) {
  element.setAttribute('onerror', "imgError(this)")
})

ready('.owl-carousel', function(element) {
  $('.owl-carousel').owlCarousel({
    center: true,
    loop: true,
    margin: 10,
    nav: true,
    items: 1,
    navText: ['<i class="fa fa-angle-left carousel-arrow" aria-hidden="true"></i>', '<i class="fa fa-angle-right carousel-arrow" aria-hidden="true"></i>']
  })
})
