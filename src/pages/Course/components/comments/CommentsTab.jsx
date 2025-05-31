import { useEffect, useState } from "react";
import { supabase } from "../../../../services/supabaseClient";
import Button from "../../../../components/ui/Button";
import { toast } from "sonner";

// مكون التقييم النجوم
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

// حساب معدل التقييم العام
function calcAverageRating(comments) {
  const rated = comments.filter(c => c.rating);
  if (!rated.length) return 0;
  return (rated.reduce((sum, c) => sum + c.rating, 0) / rated.length).toFixed(1);
}

// تجميع التعليقات مع الردود
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
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // id التعليق الذي نرد عليه

  async function fetchComments() {
    const { data } = await supabase
      .from("course_comments")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    setComments(data || []);
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [courseId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (!comment.trim()) {
      toast.error("لا يمكن إضافة تعليق فارغ");
      setLoading(false);
      return;
    }
    if (!replyTo && !rating) {
      toast.error("يرجى اختيار تقييم (نجوم) للتعليق الرئيسي");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("course_comments").insert([
      {
        course_id: courseId,
        user_id: user.id,
        comment,
        rating: replyTo ? null : rating, // الرد لا يحتاج تقييم
        parent_id: replyTo || null,
      },
    ]);
    if (!error) {
      toast.success(replyTo ? "تم إضافة الرد" : "تم إضافة التعليق");
      setComment("");
      setRating(0);
      setReplyTo(null);
      fetchComments();
    } else toast.error(error.message);
    setLoading(false);
  }

  // بناء الشجرة لعرض الردود بشكل متداخل
  const commentsTree = buildCommentsTree(comments);

  const avgRating = calcAverageRating(comments);

  return (
    <div>
      {/* معدل التقييم العام */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-bold text-orange-600 text-lg">معدل تقييم الدورة:</span>
        <StarRating value={avgRating} readOnly />
        <span className="text-blue-900 font-bold text-base">({avgRating}/5)</span>
        <span className="text-gray-400 text-sm">({comments.filter(c => c.rating).length} تقييمات)</span>
      </div>
      {/* فورم إضافة تعليق/رد */}
      <form className="flex flex-col gap-3 mb-6 bg-slate-50 rounded-xl p-4 shadow" onSubmit={handleSubmit}>
        {replyTo ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-blue-700">رد على تعليق</span>
            <Button type="button" className="bg-gray-200 text-blue-900 hover:bg-gray-300 text-xs py-1 px-2" onClick={() => setReplyTo(null)}>
              إلغاء الرد
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-950">تقييمك:</span>
            <StarRating value={rating} onChange={setRating} />
          </div>
        )}
        <textarea
          className="flex-1 border rounded-lg px-3 py-2 min-h-[40px] resize-y"
          placeholder={replyTo ? "اكتب ردك هنا..." : "أضف تعليقك مع تقييم..."}
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
            {replyTo ? "إرسال الرد" : "إرسال التعليق"}
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
            onReply={() => setReplyTo(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

// مكون عرض تعليق (مع تداخل الردود)
function CommentItem({ comment, onReply, depth = 0 }) {
  return (
    <div className={`bg-slate-50 p-4 rounded-xl shadow ${depth ? "ml-8" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <img src={comment.profiles?.avatar_url || "https://placehold.co/32x32"} alt="avatar" className="w-8 h-8 rounded-full" />
        <span className="font-bold text-orange-500">{comment.profiles?.full_name || "مستخدم"}</span>
        <span className="text-xs text-gray-400 ml-auto">{new Date(comment.created_at).toLocaleString()}</span>
      </div>
      {comment.rating && (
        <div className="mb-1">
          <StarRating value={comment.rating} readOnly size={18} />
        </div>
      )}
      <div className="text-gray-800 mb-2">{comment.comment}</div>
      <Button
        className="bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs py-1 px-2 rounded"
        type="button"
        onClick={onReply}
      >
        رد
      </Button>
      {/* الردود المتداخلة */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
