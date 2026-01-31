import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanBoard } from '../KanbanBoard'
import { ProjectTask } from '@/lib/types'
import { vi } from 'vitest'

// Mock ResizeObserver needed for dnd-kit
class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserver

const mockTasks: ProjectTask[] = [
    { id: 't1', project_id: 'p1', content: 'Task 1', status: 'TODO', order_index: 0, created_at: '', updated_at: '' },
    { id: 't2', project_id: 'p1', content: 'Task 2', status: 'IN_PROGRESS', order_index: 0, created_at: '', updated_at: '' }
]

describe('KanbanBoard', () => {
    it('renders columns and tasks', () => {
        render(<KanbanBoard tasks={mockTasks} onTaskUpdate={vi.fn()} onAddTask={vi.fn()} onDeleteTask={vi.fn()} />)
        
        expect(screen.getByText('To Do')).toBeInTheDocument()
        expect(screen.getByText('In Progress')).toBeInTheDocument()
        expect(screen.getByText('Done')).toBeInTheDocument()
        
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
    
    it('allows adding a task', () => {
        const onAddMock = vi.fn()
        render(<KanbanBoard tasks={mockTasks} onTaskUpdate={vi.fn()} onAddTask={onAddMock} onDeleteTask={vi.fn()} />)
        
        // Find "Add Task" button (the one that opens the form)
        // Since there are multiple "Add Task" buttons (one per column), we grab the first one (TODO column)
        const addBtns = screen.getAllByText('Add Task')
        fireEvent.click(addBtns[0]) 
        
        const input = screen.getByPlaceholderText('Enter task description...')
        fireEvent.change(input, { target: { value: 'New Task' } })
        
        // Now find the submit button inside the form. 
        // Other columns also have "Add Task" buttons, so we get all and pick the first one (which is in the first column "TODO")
        const submitBtns = screen.getAllByRole('button', { name: 'Add Task' })
        fireEvent.click(submitBtns[0])
        
        expect(onAddMock).toHaveBeenCalledWith('New Task', 'TODO')
    })
})
