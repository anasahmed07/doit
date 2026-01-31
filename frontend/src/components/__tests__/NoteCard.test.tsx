import { render, screen, fireEvent } from '@testing-library/react'
import { NoteCard } from '../NoteCard'
import { Note } from '@/lib/types'
import { vi } from 'vitest'

const mockNote: Note = {
  id: 'note-123',
  user_id: 'user-1',
  content: 'This is a test note content',
  order_index: 0,
  created_at: new Date().toISOString(), // Now
  updated_at: new Date().toISOString(),
  media_assets: []
}

describe('NoteCard', () => {
  it('renders note content correctly', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} onEdit={vi.fn()} />)
    
    expect(screen.getByText('This is a test note content')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDeleteMock = vi.fn()
    render(<NoteCard note={mockNote} onDelete={onDeleteMock} onEdit={vi.fn()} />)
    
    const deleteBtn = screen.getByTitle('Delete Note')
    fireEvent.click(deleteBtn)
    
    expect(onDeleteMock).toHaveBeenCalledWith(mockNote.id)
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEditMock = vi.fn()
    render(<NoteCard note={mockNote} onDelete={vi.fn()} onEdit={onEditMock} />)
    
    const editBtn = screen.getByTitle('Edit Note')
    fireEvent.click(editBtn)
    
    expect(onEditMock).toHaveBeenCalledWith(mockNote)
  })
  
  it('renders media assets', () => {
      const noteWithMedia: Note = {
          ...mockNote,
          media_assets: [
              { id: 'm1', mime_type: 'image/png', url: '/test.png' }
          ]
      }
      
      render(<NoteCard note={noteWithMedia} onDelete={vi.fn()} onEdit={vi.fn()} />)
      
      const img = screen.getByAltText('Note attachment')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', expect.stringContaining('/test.png'))
  })
})
