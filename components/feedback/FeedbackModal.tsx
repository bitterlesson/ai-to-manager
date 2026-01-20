"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Bug, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { createFeedback } from "@/lib/supabase/feedback";
import { FEEDBACK_TYPE, FeedbackType } from "@/types/feedback";

/**
 * 피드백 모달 Props
 */
interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

/**
 * 버그 리포트 / 기능 요청 모달 컴포넌트
 */
export const FeedbackModal = ({
  open,
  onOpenChange,
  userId,
}: FeedbackModalProps) => {
  const [type, setType] = useState<FeedbackType>(FEEDBACK_TYPE.BUG);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 폼 초기화
   */
  const resetForm = () => {
    setType(FEEDBACK_TYPE.BUG);
    setTitle("");
    setDescription("");
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!description.trim()) {
      toast.error("상세 설명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createFeedback(userId, {
        type,
        title: title.trim(),
        description: description.trim(),
      });

      toast.success(
        type === FEEDBACK_TYPE.BUG
          ? "버그 리포트가 제출되었습니다. 감사합니다!"
          : "기능 요청이 제출되었습니다. 감사합니다!"
      );

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("피드백 제출 실패:", error);
      toast.error(error.message || "피드백 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>버그 리포트 / 기능 요청</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 유형 선택 */}
          <div className="space-y-3">
            <Label>유형 선택</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as FeedbackType)}
              className="flex gap-4"
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FEEDBACK_TYPE.BUG} id="bug" />
                <Label
                  htmlFor="bug"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Bug className="h-4 w-4 text-destructive" />
                  버그 리포트
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FEEDBACK_TYPE.FEATURE} id="feature" />
                <Label
                  htmlFor="feature"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="h-4 w-4 text-warning" />
                  기능 요청
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder={
                type === FEEDBACK_TYPE.BUG
                  ? "어떤 문제가 발생했나요?"
                  : "어떤 기능이 필요한가요?"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          {/* 상세 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">
              상세 설명 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder={
                type === FEEDBACK_TYPE.BUG
                  ? "문제 상황을 자세히 설명해주세요.\n- 어떤 상황에서 발생했나요?\n- 예상 결과는 무엇이었나요?\n- 실제 결과는 무엇이었나요?"
                  : "원하시는 기능을 자세히 설명해주세요.\n- 어떤 기능인가요?\n- 왜 필요한가요?\n- 어떻게 작동하면 좋을까요?"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length} / 2000
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              제출하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
