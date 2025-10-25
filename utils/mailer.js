const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = (process.env.EMAIL_SECURE === 'true'); // true if 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendContactMail({ name, email, message }) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.CONTACT_FROM || process.env.EMAIL_USER,
    to: process.env.CONTACT_TO,
    subject: `New contact message from ${name}`,
    text:
`New message from MyBlog contact form:

Name: ${name}
Email: ${email}
Message:
${message}

-- End of message
`,
    html: `<h2>New Contact Message</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <hr/>
           <p>${message.replace(/\n/g, '<br/>')}</p>
           <hr/>
           <p>Received: ${new Date().toLocaleString()}</p>`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendContactMail, createTransporter };
