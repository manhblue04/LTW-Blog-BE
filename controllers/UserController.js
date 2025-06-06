const User = require("../db/userModel");
const jwt = require("jsonwebtoken");

// Secret key dùng để ký và xác thực JWT 
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Middleware kiểm tra token JWT
module.exports.requireLogin = (req, res, next) => {
  // Lấy token từ header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Chưa đăng nhập" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
  try {
    // Giải mã token, lấy thông tin user
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Lưu thông tin user vào req để dùng ở các route sau
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
};



// [POST] /admin/login
module.exports.login = async (req, res) => {
  const { login_name, password } = req.body;
  // Kiểm tra thông tin đăng nhập
  if (!login_name || !password) {
    return res.status(400).json({ error: "Thiếu login_name hoặc password" });
  }

  const user = await User.findOne({ login_name }).select("_id first_name last_name location description occupation login_name password");
  if (!user) {
    return res.status(400).json({ error: "Sai login_name hoặc password" });
  }
  if (user.password !== password) {
    return res.status(400).json({ error: "Sai login_name hoặc password" });
  }
  const token = jwt.sign(
    { _id: user._id, first_name: user.first_name, login_name: user.login_name },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({
    token,
    user: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
      login_name: user.login_name
    }
  });
};


// [POST] /admin/register - Đăng ký tài khoản mới
module.exports.register = async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  const existed = await User.findOne({ login_name });
  if (existed) {
    return res.status(400).json({ error: "login_name đã tồn tại" });
  }
  const user = new User({
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation
  });
  try {
    await user.save();
    res.json({
      login_name: user.login_name,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation
    });
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi tạo tài khoản" });
  }
};

// [POST] /admin/logout
// Với JWT, FE chỉ cần xóa token, BE không cần xử lý gì nhiều
module.exports.logout = (req, res) => {
  // Không cần xử lý gì, chỉ trả về thành công
  res.json({ message: "Đã logout (FE tự xóa token)" });
};

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
      return res.status(400).json("Không lấy được thông tin user aaa");
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
    res.status(500).json("Không lấy được thông tin user bbb");
  }
};

// [GET] api/user/count
module.exports.count = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error in count API:", error);
    res.status(500).json("Không lấy được số lượng user");
  }
};

module.exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    // Chỉ cho phép user tự sửa thông tin của mình
    if (!req.user || req.user._id !== id) {
      return res.status(403).json({ error: "Bạn không có quyền sửa thông tin người khác" });
    }
    const { location, occupation, description } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy user" });
    }
    user.location = location;
    user.occupation = occupation;
    user.description = description;
    await user.save();
    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// [GET] api/user/:id/name - Lấy tên theo id
module.exports.getName = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("first_name last_name");
    if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
    res.json({ first_name: user.first_name, last_name: user.last_name });
  } catch (e) {
    res.status(500).json({ error: "Lỗi server" });
  }
};


