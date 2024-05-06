document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener("submit", submitemail);

  // By default, load the inbox
  load_mailbox('inbox');

  fetch('/emails/sent')
.then(response => response.json())
.then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
});


});

function compose_email(reply) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#singleemail').style.display = 'none'


  // Clear out composition fields
  if (reply == undefined){
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else{
    document.querySelector('#compose-recipients').value = reply.sender;
    if(reply.subject.slice(3) == "Re:"){
      document.querySelector('#compose-subject').value = reply.subject;
    } else{
      document.querySelector('#compose-subject').value = `Re: ${reply.subject}`;
    }
    
    document.querySelector('#compose-body').value = `On ${reply.timestamp} ${reply.sender} wrote:
  ${reply.body} `;
  }
  

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#singleemail').style.display = 'none'

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        emails.forEach(element => {
          
            document.querySelector('#emails-view').innerHTML += `<div id="${element.id}" class="emailbox ${element.read ? 'read' : '' }"> <h4>${element.sender}</h4> <h3>${element.subject}</h3><div> <h6>${element.timestamp}</h6> ${mailbox=="inbox" ? '<p class="archive" style="text-align: right; color: blue">Archive</p>' : ''} ${mailbox=="archive" ? '<p class="unarchive" style="text-align: right; color: blue">Unarchive</p>' : ''} <p class="reply" style="text-align: right; color: blue">Reply</p> </div> </div>`;                  
        });
            document.querySelectorAll(".reply").forEach(
              reply=>{
                reply.addEventListener('click', ()=>{
                  fetch(`/emails/${reply.parentNode.parentNode.id}`)
                  .then(response => response.json())
                  .then(email => {
                      compose_email(email);
                  });
                  
                })
              }
            )
            document.querySelectorAll(".emailbox").forEach(
            email => {
              email.addEventListener("click", ()=> {

                fetch(`/emails/${event.target.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                  })
                })
                
                  fetch(`/emails/${event.target.id}`)
                  .then(response => response.json())
                  .then(email => {
                      // Print email
                      
                      showsingleemail(email);

                      // ... do something else with email ...
                  });

              })
            }
          )

          document.querySelectorAll(".archive").forEach(item=>{
            item.addEventListener('click',()=>{
             
              fetch(`/emails/${item.parentNode.parentNode.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              load_mailbox('inbox');
              
            })
          })
          document.querySelectorAll(".unarchive").forEach(item=>{
            item.addEventListener('click',()=>{
             
              fetch(`/emails/${item.parentNode.parentNode.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
              load_mailbox('archive');
              
            })
          })
    });
 


  

}

function showsingleemail(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  const mail = document.querySelector('#singleemail');
  mail.style.display = 'block'
  mail.innerHTML = `<div><p>from ${email.sender} </br> to ${email.recipients}</p>
  <h3>${email.subject}</h3> <p>${email.timestamp}</p></div> <p>${email.body}</p> `
}

function submitemail(event){
  event.preventDefault();
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent');
}