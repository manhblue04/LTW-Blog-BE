const User = require("../db/userModel");

// [GET] api/user/list
module.exports.index = async (req, res) => {
  try {
    const users = await User.find();

    const userList = users.map(u => ({
      _id: u._id,
      first_name: u.first_name,
      last_name: u.last_name
    }));
    res.json(userList);
  } catch (error) {
    res.json("Không lấy được danh sách user");
  }
};

// [GET] api/user/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    
    const user = await User.findOne({ _id: id }).select("_id first_name last_name location description occupation");

    if (!user) {
      return res.status(400).json("Không lấy được thông tin user");
    }

    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation
    });
  } catch (error) {
    res.status(500).json("Không lấy được thông tin user");
  }
};


