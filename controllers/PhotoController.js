const Photo = require("../db/photoModel");
const User = require("../db/userModel");

// [GET] api/photo/photosOfUser/:id
module.exports.photosOfUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const photos = await Photo.find({ user_id: userId }).lean();
    const result = [];

    for (const photo of photos) {
      // Mảng chứa danh sách comment kèm thông tin user của từng comment
      const commentsWithUser = [];
      if (photo.comments && photo.comments.length > 0) {
        for (const comment of photo.comments) {
          const user = await User.findById(comment.user_id).select("_id first_name last_name").lean();
          
          const commentObj = {
            _id: comment._id,
            comment: comment.comment,
            date_time: comment.date_time,
            user: user
              ? {
                  _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                }
              : null, 
          };
          // Thêm vào danh sách comment của ảnh
          commentsWithUser.push(commentObj);
        }
      }
      // Tạo object chứa thông tin ảnh và danh sách comment
      const photoObj = {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: commentsWithUser,
      };

      result.push(photoObj);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Thêm API thêm bình luận mới cho ảnh
module.exports.addCommentToPhoto = async (req, res) => {
  try {
    const photoId = req.params.photo_id;
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Nội dung bình luận không được rỗng" });
    }
    // Lấy user id từ token đã giải mã
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }
    // Tìm ảnh
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Không tìm thấy ảnh" });
    }
    // Tạo comment mới
    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: userId,
    };
    photo.comments.push(newComment);
    await photo.save();

    // Lấy thông tin user để trả về kèm comment
    const user = await User.findById(userId).select("_id first_name last_name").lean();
    const commentObj = {
      _id: photo.comments[photo.comments.length - 1]._id,
      comment: newComment.comment,
      date_time: newComment.date_time,
      user: user
        ? {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
          }
        : null,
    };
    res.json(commentObj);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};
