"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, SortAsc, X } from "lucide-react";
import { PRIORITY, TodoSortBy } from "@/types/todo";

/**
 * 대시보드 툴바 컴포넌트
 * 검색, 필터, 정렬 기능 제공
 */
interface ToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedPriorities?: string[];
  onPriorityChange?: (priorities: string[]) => void;
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
  selectedStatus?: string[];
  onStatusChange?: (status: string[]) => void;
  sortBy?: TodoSortBy;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: TodoSortBy, order: "asc" | "desc") => void;
  availableCategories?: string[];
}

export const Toolbar = ({
  searchQuery = "",
  onSearchChange,
  selectedPriorities = [],
  onPriorityChange,
  selectedCategories = [],
  onCategoryChange,
  selectedStatus = [],
  onStatusChange,
  sortBy = "created_date",
  sortOrder = "desc",
  onSortChange,
  availableCategories = [],
}: ToolbarProps) => {
  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  /**
   * 검색어 초기화
   */
  const handleClearSearch = () => {
    onSearchChange?.("");
  };

  /**
   * 우선순위 필터 토글
   */
  const togglePriority = (priority: string) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];
    onPriorityChange?.(newPriorities);
  };

  /**
   * 카테고리 필터 토글
   */
  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoryChange?.(newCategories);
  };

  /**
   * 상태 필터 토글
   */
  const toggleStatus = (status: string) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status];
    onStatusChange?.(newStatus);
  };

  /**
   * 정렬 변경 핸들러
   */
  const handleSortChange = (value: string) => {
    const [newSortBy, newOrder] = value.split("-") as [TodoSortBy, "asc" | "desc"];
    onSortChange?.(newSortBy, newOrder);
  };

  /**
   * 활성화된 필터 개수 계산
   */
  const activeFiltersCount =
    selectedPriorities.length + selectedCategories.length + selectedStatus.length;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* 검색 입력창 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="할 일 검색..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 필터 버튼 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                필터
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* 우선순위 필터 */}
              <DropdownMenuLabel>우선순위</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes(PRIORITY.HIGH)}
                onCheckedChange={() => togglePriority(PRIORITY.HIGH)}
              >
                <span className="text-destructive">높음</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes(PRIORITY.MEDIUM)}
                onCheckedChange={() => togglePriority(PRIORITY.MEDIUM)}
              >
                <span className="text-warning">보통</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedPriorities.includes(PRIORITY.LOW)}
                onCheckedChange={() => togglePriority(PRIORITY.LOW)}
              >
                <span className="text-success">낮음</span>
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              {/* 상태 필터 */}
              <DropdownMenuLabel>상태</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={selectedStatus.includes("in-progress")}
                onCheckedChange={() => toggleStatus("in-progress")}
              >
                진행 중
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatus.includes("completed")}
                onCheckedChange={() => toggleStatus("completed")}
              >
                완료
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedStatus.includes("overdue")}
                onCheckedChange={() => toggleStatus("overdue")}
              >
                지연
              </DropdownMenuCheckboxItem>

              {/* 카테고리 필터 */}
              {availableCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>카테고리</DropdownMenuLabel>
                  {availableCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 정렬 드롭다운 */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_date-desc">최신순</SelectItem>
              <SelectItem value="created_date-asc">오래된순</SelectItem>
              <SelectItem value="due_date-asc">마감일 가까운순</SelectItem>
              <SelectItem value="due_date-desc">마감일 먼순</SelectItem>
              <SelectItem value="priority-desc">우선순위 높은순</SelectItem>
              <SelectItem value="priority-asc">우선순위 낮은순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 활성화된 필터 표시 */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedPriorities.map((priority) => (
              <Badge key={priority} variant="secondary" className="gap-1">
                {priority === PRIORITY.HIGH && "높음"}
                {priority === PRIORITY.MEDIUM && "보통"}
                {priority === PRIORITY.LOW && "낮음"}
                <button
                  onClick={() => togglePriority(priority)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedStatus.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                {status === "in-progress" && "진행 중"}
                {status === "completed" && "완료"}
                {status === "overdue" && "지연"}
                <button
                  onClick={() => toggleStatus(status)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1">
                {category}
                <button
                  onClick={() => toggleCategory(category)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
