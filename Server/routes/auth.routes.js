const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');


router.post('/signup', authCtrl.signup);
router.post('/signin', authCtrl.signin);


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('User not found');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const resetLink = `http://localhost:4200/reset-password/${token}`;

  // Get user's first name (assuming you have a name field)
  const firstName = user.name ? user.name.split(' ')[0] : 'there';

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #f8f9fa;
          padding: 40px 20px;
          line-height: 1.6;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #ff4757, #ff3742);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .logo {
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .message {
          font-size: 16px;
          color: #5a6c7d;
          margin-bottom: 35px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 35px;
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(255, 71, 87, 0.3);
        }
        .disclaimer {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .footer {
          border-top: 1px solid #e9ecef;
          padding: 30px;
          text-align: center;
        }
        .team-signature {
          color: #2c3e50;
          font-size: 16px;
          font-weight: 500;
        }
        .company-info {
          margin-top: 20px;
          font-size: 12px;
          color: #95a5a6;
        }
        @media (max-width: 600px) {
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 24px;
          }
          .button {
            padding: 14px 28px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
            <div class="logo">
              <img src="../Client/src/assets/img/logo-ft.png" />
            </div>
          <h1>Reset your password</h1>
        </div>
        
        <div class="content">
          <div class="greeting">Hi ${firstName},</div>
          
          <div class="message">
            We're sending you this email because you requested a password reset. Click on the button below to create a new password:
          </div>
          
          <a href="${resetLink}" class="button">Set a new password</a>
          
          <div class="disclaimer">
            If you didn't request a password reset, you can ignore this email. Your password will not be changed.
          </div>
        </div>
        
        <div class="footer">
          <div class="team-signature">Fetchtern team</div>
          <div class="company-info">
            This email was sent from a secure server.<br>
            If you have any questions, please contact our support team.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Nodemailer for mail sending
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: user.email,
    subject: 'Reset your password',
    html: htmlTemplate
  });

  res.json({ message: 'Reset link sent to email' });
});



router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('User not found');

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).send('Invalid or expired token');
  }
});


router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { email: decoded.email }; 
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}


router.put('/update-keyword-schedule/:id', async (req, res) => {
  const { keyword, schedule } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { keyword, schedule },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/joblogs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('jobLogs');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ jobLogs: user.jobLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.delete('/remove-schedule/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        $unset: {
          keyword: "",
          schedule: "",
          jobLogs: ""
        }
      },
      { new: true } // return updated user
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Fields removed successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});








// NOT IMPLEMENTED YET 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check if user exists or create new
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
      });
    }

    // Generate your app’s JWT token (optional)
    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token: appToken, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

////////////////////////////////////






module.exports = router;
