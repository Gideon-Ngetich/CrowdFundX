const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendInviteEmail = async (email, groupName, token, groupId) => {
  // const acceptLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}&groupId=${groupId}`;
  
  await transporter.sendMail({
    to: email,
    subject: `${groupName} Invitation`,
    html: `
      <h2>Join ${groupName}</h2>
      <p>You have been invited to join ${groupName}</p>
     <p>Login to your account and navigated to invited campaigns to view the campaign details</>
    `
  });
};

module.exports = { sendInviteEmail };