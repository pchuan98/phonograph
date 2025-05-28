import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
}

const initialColumns: Column[] = [
  { id: 'todo', title: '待办', color: 'bg-gray-100' },
  { id: 'inprogress', title: '进行中', color: 'bg-blue-100' },
  { id: 'review', title: '待审核', color: 'bg-yellow-100' },
  { id: 'done', title: '已完成', color: 'bg-green-100' },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: '设计用户界面',
    description: '创建响应式设计',
    priority: 'high',
    assignee: '张三',
    columnId: 'todo',
  },
  {
    id: '2',
    title: 'API集成',
    description: '连接后端服务',
    priority: 'medium',
    assignee: '李四',
    columnId: 'todo',
  },
  {
    id: '3',
    title: '数据库优化',
    description: '提升查询性能',
    priority: 'high',
    assignee: '王五',
    columnId: 'inprogress',
  },
  {
    id: '4',
    title: '代码审查',
    description: '检查代码质量',
    priority: 'low',
    assignee: '赵六',
    columnId: 'review',
  },
  {
    id: '5',
    title: '项目初始化',
    description: '搭建项目框架',
    priority: 'medium',
    assignee: '钱七',
    columnId: 'done',
  },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
};

// 可拖拽的任务卡片组件
const SortableTaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-3 cursor-pointer hover:shadow-md transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
        }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
            {task.description && (
              <p className="text-xs text-gray-600 mb-3">{task.description}</p>
            )}
            <div className="flex justify-between items-center">
              <Badge
                variant="outline"
                className={`text-xs ${priorityColors[task.priority]}`}
              >
                {priorityLabels[task.priority]}
              </Badge>
              {task.assignee && (
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {task.assignee.charAt(0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 看板列组件
const KanbanColumn: React.FC<{
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
}> = ({ column, tasks, onAddTask }) => {
  return (
    <div className="flex-1 min-w-[300px] max-w-[350px]">
      <Card className="h-full border-0 shadow-lg">
        <CardHeader className={`pb-3 rounded-t-lg ${column.color}`}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-semibold text-gray-800">
              {column.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-white/80">
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col h-full">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 mb-4"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加任务
          </Button>
          <ScrollArea className="flex-1 pr-2">
            <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// 主看板组件
export const Kanban: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((task) => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overColumnId = over.id as string;

    // 如果是拖拽到列上
    if (initialColumns.some(col => col.id === overColumnId)) {
      if (activeTask.columnId !== overColumnId) {
        setTasks((tasks) =>
          tasks.map((task) =>
            task.id === active.id ? { ...task, columnId: overColumnId } : task
          )
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    const overTask = tasks.find((task) => task.id === over.id);

    if (!activeTask) return;

    // 如果拖拽到另一个任务上，重新排序
    if (overTask && activeTask.id !== overTask.id) {
      const activeIndex = tasks.findIndex((task) => task.id === active.id);
      const overIndex = tasks.findIndex((task) => task.id === over.id);

      if (activeIndex !== overIndex) {
        setTasks((tasks) => {
          const newTasks = [...tasks];
          const [removed] = newTasks.splice(activeIndex, 1);
          newTasks.splice(overIndex, 0, { ...removed, columnId: overTask.columnId });
          return newTasks;
        });
      }
    }
  };

  const handleAddTask = (columnId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '新任务',
      description: '点击编辑任务描述',
      priority: 'medium',
      assignee: '未分配',
      columnId,
    };
    setTasks([...tasks, newTask]);
  };

  const getTasksByColumn = (columnId: string) =>
    tasks.filter((task) => task.columnId === columnId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">项目看板</h1>
        <p className="text-gray-600">拖拽任务卡片来管理你的项目进度</p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {initialColumns.map((column) => (
            <SortableContext
              key={column.id}
              items={getTasksByColumn(column.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                column={column}
                tasks={getTasksByColumn(column.id)}
                onAddTask={handleAddTask}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className="w-[280px] opacity-90 rotate-3 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">
                      {activeTask.title}
                    </h4>
                    {activeTask.description && (
                      <p className="text-xs text-gray-600 mb-3">
                        {activeTask.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className={`text-xs ${priorityColors[activeTask.priority]}`}
                      >
                        {priorityLabels[activeTask.priority]}
                      </Badge>
                      {activeTask.assignee && (
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {activeTask.assignee.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
