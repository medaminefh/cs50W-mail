document.addEventListener("DOMContentLoaded", function () {
  const error = document.querySelector("#error");

  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  const form = document.querySelector("#compose-form");

  // By default, load the inbox
  load_mailbox("inbox");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const recipients = this.querySelector("#compose-recipients").value;
    const subject = this.querySelector("#compose-subject").value;
    const body = this.querySelector("#compose-body").value;

    if (!recipients || !subject || !body) {
      error.innerText = "Fill All the Fields please!";
      return;
    }

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients,
        subject,
        body,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.error);
        if (data.error) {
          error.innerText = data.error;
          return;
        }
        load_mailbox("sent");
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  error.innerText = "";
  const emailsView = document.querySelector("#emails-view");
  emailsView.style.display = "block";
  emailsView.innerHTML = "";
  const composeView = document.querySelector("#compose-view");
  composeView.style.display = "none";

  fetch(`/emails/${mailbox.toLowerCase()}`)
    .then((res) => res.json())
    .then((data) => {
      // Show the mailbox name
      const emailsView = document.createElement("ul");

      data.map((email) => {
        const li = document.createElement("li");
        li.className =
          "p-2 border d-flex justify-content-between align-items-center";
        li.innerHTML = `<span>
          <strong> 
          <a href="/emails/${email.id}">
           ${email.sender} 
           </a> 
           </strong> ${email.subject}
          </span>
          <span class="text-secondary">${email.timestamp}</span>`;
        emailsView.appendChild(li);
      });

      document.querySelector("#emails-view").innerHTML = `<h3>${
        mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
      }</h3>`;
      document.querySelector("#emails-view").appendChild(emailsView);
    })
    .catch((err) => {
      console.log(err);
    });
}
