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
  const acceptLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}&groupId=${groupId}`;
  
  await transporter.sendMail({
    to: email,
    subject: `You're invited to ${groupName}`,
    html: `
      <h2>Join ${groupName}</h2>
      <p>Click below to accept your invitation:</p>
      <a href="${acceptLink}" 
         style="padding: 10px 20px; background: #1890ff; color: white; text-decoration: none; border-radius: 5px;">
         Accept Invitation
      </a>
      <p>Or copy this link: ${acceptLink}</p>
    `
  });
};

module.exports = { sendInviteEmail };