# ✨ Enhanced Task Management Features

## Overview

This document details the new task management features implemented in the TODO application, including task completion, soft deletion, and advanced filtering capabilities.

## 🎯 New Features

### 1. Complete Tasks with Mandatory Comments

**Endpoint:** `PUT /api/tareas/:id/completar`

**Purpose:** Mark tasks as completed with a mandatory comment explaining the completion.

**Request Body:**
```json
{
  "comentario": "Task completed successfully. All requirements were met and deliverables submitted."
}
```

**Response (Success - 200):**
```json
{
  "mensaje": "Tarea completada exitosamente"
}
```

**Response (Error - 400):**
```json
{
  "error": "El comentario es requerido para completar la tarea"
}
```

### 2. Soft Delete Tasks with Mandatory Comments

**Endpoint:** `DELETE /api/tareas/:id/borrar`

**Purpose:** Soft delete tasks (logical deletion) with a mandatory comment explaining the deletion reason.

**Request Body:**
```json
{
  "comentario": "Task cancelled due to changing project priorities and requirements."
}
```

**Response (Success - 200):**
```json
{
  "mensaje": "Tarea borrada exitosamente"
}
```

**Response (Error - 400):**
```json
{
  "error": "El comentario es requerido para borrar la tarea"
}
```

### 3. Advanced Task Filtering

**Endpoint:** `GET /api/tareas?filter={filterType}`

**Available Filters:**
- `all` (default) - Active tasks only (excludes deleted)
- `pending` - Pending tasks (not completed, not deleted)
- `completed` - Completed tasks (not deleted)
- `deleted` - Deleted tasks only
- `all_including_deleted` - All tasks including deleted ones

**Example Response:**
```json
{
  "mensaje": "Se encontraron 3 tarea(s)",
  "tareas": [
    {
      "id": 1,
      "titulo": "Complete project documentation",
      "descripcion": "Write comprehensive documentation for the project",
      "completada": true,
      "borrada": false,
      "fechaCreacion": "2024-01-01T10:00:00.000Z",
      "fechaActualizacion": "2024-01-02T15:30:00.000Z",
      "fechaCompletada": "2024-01-02T15:30:00.000Z",
      "fechaBorrado": null,
      "comentarioCompletar": "Documentation completed with all sections covered",
      "comentarioBorrado": null
    }
  ]
}
```

## 🗄️ Database Schema Changes

### Enhanced Tarea Table Structure

New columns added to `Gestion.Tarea`:

| Column | Type | Description |
|--------|------|-------------|
| `borrada` | BIT | Soft delete flag (0 = active, 1 = deleted) |
| `fechaCompletada` | DATETIME | Timestamp when task was completed |
| `fechaBorrado` | DATETIME | Timestamp when task was deleted |
| `comentarioCompletar` | NVARCHAR(500) | Comment provided when completing task |
| `comentarioBorrado` | NVARCHAR(500) | Comment provided when deleting task |

## 🛠️ Frontend Integration Guidelines

### 1. Task List Display

When displaying tasks, consider the new fields:

```javascript
// Example task object structure
const task = {
  id: 1,
  titulo: "Task Title",
  descripcion: "Task Description",
  completada: false,
  borrada: false,
  fechaCreacion: "2024-01-01T10:00:00.000Z",
  fechaActualizacion: "2024-01-01T10:00:00.000Z",
  fechaCompletada: null,
  fechaBorrado: null,
  comentarioCompletar: null,
  comentarioBorrado: null
};

// Display logic
const getTaskStatus = (task) => {
  if (task.borrada) return 'deleted';
  if (task.completada) return 'completed';
  return 'pending';
};

const getTaskStatusColor = (task) => {
  switch(getTaskStatus(task)) {
    case 'completed': return 'green';
    case 'deleted': return 'red';
    default: return 'gray';
  }
};
```

### 2. Filter Implementation

```javascript
// Filter options for dropdown/tabs
const filterOptions = [
  { value: 'all', label: 'Active Tasks', description: 'Show pending and completed tasks' },
  { value: 'pending', label: 'Pending', description: 'Show only pending tasks' },
  { value: 'completed', label: 'Completed', description: 'Show only completed tasks' },
  { value: 'deleted', label: 'Deleted', description: 'Show only deleted tasks' },
  { value: 'all_including_deleted', label: 'All Tasks', description: 'Show all tasks including deleted' }
];

// API call with filter
const fetchTasks = async (filter = 'all') => {
  const response = await fetch(`/api/tareas?filter=${filter}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 3. Complete Task Modal

```javascript
// Complete task function
const completeTask = async (taskId, comment) => {
  const response = await fetch(`/api/tareas/${taskId}/completar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ comentario: comment })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete task');
  }
  
  return response.json();
};

// Modal component requirements
const CompleteTaskModal = ({ taskId, onSuccess, onClose }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      alert('Comment is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await completeTask(taskId, comment.trim());
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h3>Complete Task</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Please provide a comment explaining the task completion..."
          maxLength={500}
          required
        />
        <div className="modal-actions">
          <button type="submit" disabled={isSubmitting || !comment.trim()}>
            {isSubmitting ? 'Completing...' : 'Complete Task'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};
```

### 4. Delete Task Modal

```javascript
// Delete task function
const deleteTask = async (taskId, comment) => {
  const response = await fetch(`/api/tareas/${taskId}/borrar`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ comentario: comment })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }
  
  return response.json();
};

// Similar modal implementation for deletion
```

### 5. Task History Display

```javascript
// Display task history information
const TaskHistory = ({ task }) => {
  return (
    <div className="task-history">
      <p><strong>Created:</strong> {formatDate(task.fechaCreacion)}</p>
      <p><strong>Last Updated:</strong> {formatDate(task.fechaActualizacion)}</p>
      
      {task.completada && (
        <div className="completion-info">
          <p><strong>Completed:</strong> {formatDate(task.fechaCompletada)}</p>
          <p><strong>Completion Comment:</strong> {task.comentarioCompletar}</p>
        </div>
      )}
      
      {task.borrada && (
        <div className="deletion-info">
          <p><strong>Deleted:</strong> {formatDate(task.fechaBorrado)}</p>
          <p><strong>Deletion Comment:</strong> {task.comentarioBorrado}</p>
        </div>
      )}
    </div>
  );
};
```

## 🔒 Security & Validation

### Backend Validations

1. **Authentication Required:** All endpoints require valid JWT token
2. **Comment Validation:** 
   - Must be non-empty string
   - Maximum 500 characters
   - Whitespace-only comments are rejected
3. **Task Ownership:** Users can only operate on their own tasks
4. **State Validation:** 
   - Can't complete already completed tasks
   - Can't delete already deleted tasks
   - Can't operate on non-existent tasks

### Frontend Validations

Implement corresponding client-side validations:

```javascript
const validateComment = (comment) => {
  if (!comment || !comment.trim()) {
    return 'Comment is required';
  }
  if (comment.length > 500) {
    return 'Comment must be 500 characters or less';
  }
  return null;
};

const validateTaskAction = (task, action) => {
  if (action === 'complete' && task.completada) {
    return 'Task is already completed';
  }
  if (action === 'delete' && task.borrada) {
    return 'Task is already deleted';
  }
  if (action === 'complete' && task.borrada) {
    return 'Cannot complete a deleted task';
  }
  return null;
};
```

## 🎨 UI/UX Recommendations

### Task Status Indicators
- **Pending**: Gray/neutral color, regular text
- **Completed**: Green color, check mark icon, optional strikethrough
- **Deleted**: Red color, crossed out, optional fade effect

### Filter Tabs/Buttons
- Show count of tasks in each category
- Use clear, descriptive labels
- Highlight active filter

### Modal Design
- Clear title indicating the action
- Prominent textarea for comment
- Character counter (500 max)
- Clear call-to-action buttons
- Proper validation feedback

### Comment Display
- Show comments in tooltips or expandable sections
- Format dates consistently
- Use appropriate typography hierarchy

## 🧪 Testing Recommendations

### Frontend Tests

1. **Component Tests:**
   - Modal rendering and validation
   - Filter functionality
   - Task status display

2. **Integration Tests:**
   - API calls with different scenarios
   - Error handling
   - Loading states

3. **User Flow Tests:**
   - Complete task workflow
   - Delete task workflow
   - Filter switching

### Example Test Cases

```javascript
// Example Jest test for task completion
describe('CompleteTaskModal', () => {
  it('should require comment before submission', () => {
    const { getByRole } = render(<CompleteTaskModal taskId={1} />);
    const submitButton = getByRole('button', { name: /complete task/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when comment is provided', () => {
    const { getByRole, getByPlaceholderText } = render(<CompleteTaskModal taskId={1} />);
    const textarea = getByPlaceholderText(/provide a comment/i);
    const submitButton = getByRole('button', { name: /complete task/i });
    
    fireEvent.change(textarea, { target: { value: 'Task completed' } });
    expect(submitButton).not.toBeDisabled();
  });
});
```

## 📱 Mobile Considerations

- Use appropriate input types for mobile
- Consider using native modals/sheets on mobile
- Ensure touch targets are adequate size
- Test textarea behavior on different mobile keyboards
- Consider comment length on smaller screens

## 🚀 Performance Tips

- Cache task lists and update locally after actions
- Use optimistic updates for better UX
- Implement proper loading states
- Consider pagination for large task lists
- Debounce filter changes if implemented as search
