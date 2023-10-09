const isAuth = (req, res, next) => {
  if (req.user) next();
  else {
    res.status(401).json({ loggedIn: false });
  }
};

module.exports = isAuth;
