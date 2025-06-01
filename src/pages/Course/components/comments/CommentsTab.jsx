import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import { toast } from "sonner";
import { useCoursesData } from "../../../../contexts/CoursesDataContext";
import { Trash2, Edit2 } from "lucide-react";

// ⭐️ مكون التقييم النجوم
function StarRating({ value, onChange, readOnly = false, size = 22 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer ${star <= value ? "text-yellow-400" : "text-gray-300"} select-none`}
          style={{ fontSize: size }}
          onClick={() => !readOnly && onChange?.(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// بناء شجرة الردود
function buildCommentsTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
  comments.forEach((c) => {
    if (c.parent_id) {
      map[c.parent_id]?.replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

export default function CommentsTab({ courseId, user }) {
  const {
    commentsMap,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
    ratingsMap,
    fetchCourseRating,
    setCourseRating,
    loading: contextLoading,
  } = useCoursesData();

  const comments = commentsMap?.[courseId] || [];
  const ratingObj = ratingsMap?.[courseId] || { avg: 0, count: 0, myRating: 0 };

  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editData, setEditData] = useState(null); // {id, comment}

  useEffect(() => {
    fetchComments(courseId);
    fetchCourseRating(courseId, user.id);
    // eslint-disable-next-line
  }, [courseId, user.id]);

  // إضافة تعليق أو رد أو تعديل
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!comment.trim()) {
      toast.error("لا يمكن إضافة تعليق فارغ");
      setLoading(false);
      return;
    }
    try {
      if (editData) {
        // تعديل
        await editComment({
          commentId: editData.id,
          newComment: comment,
        });
        toast.success("تم تعديل التعليق بنجاح");
      } else {
        // إضافة
        await addComment({
          courseId,
          userId: user.id,
          comment,
          parentId: replyTo,
        });
        toast.success(replyTo ? "تم إضافة الرد" : "تم إضافة التعليق");
      }
      setComment("");
      setReplyTo(null);
      setEditData(null);
      fetchComments(courseId);
    } catch (err) {
      toast.error("حدث خطأ أثناء العملية");
    }
    setLoading(false);
  }

  // حذف تعليق أو رد
  async function handleDelete(commentId) {
    toast.promise(
      deleteComment(commentId),
      {
        loading: "جاري حذف التعليق...",
        success: () => {
          fetchComments(courseId);
          return "تم حذف التعليق";
        },
        error: "فشل حذف التعليق",
      }
    );
  }

  // تحضير للتعديل
  function startEdit(selectedComment) {
    setEditData({
      id: selectedComment.id,
      comment: selectedComment.comment,
    });
    setComment(selectedComment.comment);
    setReplyTo(null);
  }

  // عند التقييم أو تغييره
  async function handleRatingChange(newRating) {
    setLoading(true);
    await setCourseRating(courseId, user.id, newRating);
    fetchCourseRating(courseId, user.id);
    setLoading(false);
  }

  // شجرة التعليقات مع الردود
  const commentsTree = buildCommentsTree(comments);

  return (
    <div>
      {/* معدل التقييم العام + تقييمي */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="font-bold text-orange-600 text-lg">معدل تقييم الدورة:</span>
        <StarRating value={Number(ratingObj.avg)} readOnly />
        <span className="text-blue-900 font-bold text-base">({ratingObj.avg}/5)</span>
        <span className="text-gray-400 text-sm">({ratingObj.count} تقييمات)</span>
        <span className="mx-2 hidden sm:block">|</span>
        {/* تقييم المستخدم الحالي */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">تقييمك:</span>
          <StarRating value={ratingObj.myRating} onChange={handleRatingChange} readOnly={loading || contextLoading} />
        </div>
      </div>

      {/* فورم إضافة أو تعديل تعليق/رد */}
      <form className="flex flex-col gap-3 mb-6 bg-slate-50 rounded-xl p-4 shadow" onSubmit={handleSubmit}>
        {editData ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-blue-900">تعديل التعليق</span>
            <Button type="button" className="bg-gray-200 text-blue-900 hover:bg-gray-300 text-xs py-1 px-2" onClick={() => {
              setEditData(null);
              setComment("");
            }}>
              إلغاء التعديل
            </Button>
          </div>
        ) : replyTo ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-blue-700">رد على تعليق</span>
            <Button type="button" className="bg-gray-200 text-blue-900 hover:bg-gray-300 text-xs py-1 px-2" onClick={() => setReplyTo(null)}>
              إلغاء الرد
            </Button>
          </div>
        ) : null}

        <textarea
          className="flex-1 border rounded-lg px-3 py-2 min-h-[40px] resize-y"
          placeholder={editData ? "تعديل تعليقك..." : replyTo ? "اكتب ردك هنا..." : "أضف تعليقك ..."}
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={loading || contextLoading}
        />

        <div className="flex gap-2">
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading || contextLoading}>
            {editData ? "حفظ التعديل" : replyTo ? "إرسال الرد" : "إرسال التعليق"}
          </Button>
        </div>
      </form>

      {/* عرض التعليقات مع الردود */}
      <div className="flex flex-col gap-5">
        {commentsTree.length === 0 && <div className="text-gray-400">لا توجد تعليقات بعد.</div>}
        {commentsTree.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            userId={user.id}
            onReply={() => {
              setReplyTo(c.id);
              setEditData(null);
              setComment("");
            }}
            onEdit={(cmnt) => startEdit(cmnt)}
            onDelete={(cmnt) => handleDelete(cmnt.id)}
          />
        ))}
      </div>
    </div>
  );
}

// مكون عرض تعليق (مع تداخل الردود)
function CommentItem({ comment, onReply, onEdit, onDelete, userId, depth = 0 }) {
  const isOwner = userId === comment.user_id;
  return (
    <div className={`bg-slate-50 p-4 rounded-xl shadow ${depth ? "ml-8" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <img src={comment.profiles?.avatar_url || comment.profile?.avatar_url || "https://placehold.co/32x32"} alt="avatar" className="w-8 h-8 rounded-full" />
        <span className="font-bold text-orange-500">{comment.profiles?.full_name || comment.profile?.full_name || "مستخدم"}</span>
        <span className="text-xs text-gray-400 ml-auto">{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      <div className="text-gray-800 mb-2">{comment.comment}</div>
      <div className="flex gap-2">
        <Button
          className="bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs py-1 px-2 rounded"
          type="button"
          onClick={onReply}
        >
          رد
        </Button>
        {isOwner && (
          <>
            <Button
              className="bg-gray-50 text-blue-900 hover:bg-gray-200 text-xs py-1 px-2 rounded flex items-center gap-1"
              type="button"
              onClick={() => onEdit(comment)}
            >
              <Edit2 size={14} /> تعديل
            </Button>
            <Button
              className="bg-red-50 text-red-600 hover:bg-red-200 text-xs py-1 px-2 rounded flex items-center gap-1"
              type="button"
              onClick={() => onDelete(comment)}
            >
              <Trash2 size={14} /> حذف
            </Button>
          </>
        )}
      </div>
      {/* الردود المتداخلة */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              userId={userId}
              onReply={() => onReply(reply)}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
