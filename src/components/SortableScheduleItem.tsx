import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableScheduleItemProps = {
  schedule: any;
  scheduleIndex: number;
  onDelete: (id: number) => void;
};

export default function SortableScheduleItem({
  schedule,
  scheduleIndex,
  onDelete,
}: SortableScheduleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="schedule-item" ref={setNodeRef} style={style}>
      <div
        className="schedule-number"
        {...attributes}
        {...listeners}
        style={{ cursor: "grab" }}
      >
        {scheduleIndex + 1}
      </div>

      <div className="schedule-content">
        <p className="schedule-place">{schedule.place}</p>
        {schedule.memo && <p className="schedule-memo">{schedule.memo}</p>}
      </div>

      <button className="delete-btn" onClick={() => onDelete(schedule.id)}>
        ✕
      </button>
    </div>
  );
}