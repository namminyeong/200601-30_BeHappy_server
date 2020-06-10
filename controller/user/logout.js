module.exports = {
  logout: (req, res) => {
    res.cookie('token', '').status(200).json({
      token: '',
      message: 'succeed logout',
    });
  },
};
