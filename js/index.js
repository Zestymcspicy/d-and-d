const charForm = document.forms["charForm"]
const  url= "http://localhost:1234";

function addCharacter() {
  const name = document.getElementById('nameInput');
  const level = document.getElementById('levelInput');
  const charClass = document.getElementById('classInput');
    const newChar = {
      name: name.value,
      level: Number(level.value),
      class: charClass.value
    };
    const myJSON = JSON.stringify(newChar)
    console.log(myJSON);
    fetch(`${url}/characters/create/`, {
      method: 'POST',
      body: `name=${name.value}&level=${level.value}&class=${charClass.value}`,
      headers: {
        'Content-Type': "application/x-www-form-urlencoded",
      },
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }



charForm.addEventListener("submit", function(e) {
  // e.preventDefault();
  addCharacter()
}, false)
