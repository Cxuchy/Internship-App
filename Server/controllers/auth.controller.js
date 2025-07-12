const User = require('../models/user.model');
const jwt = require('jsonwebtoken');



const createToken = user => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture
        },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
};


exports.signup = async (req, res) => {
  const { email, password , firstName, lastName , DatOfBirth , profilePicture } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ email, password , firstName, lastName , DatOfBirth , profilePicture  });
    await user.save();

    const token = createToken(user);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
