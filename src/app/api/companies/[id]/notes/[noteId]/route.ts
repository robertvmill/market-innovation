import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId, noteId } = await params
    const body = await request.json()

    // Verify user owns this company and note exists
    // @ts-ignore
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        companyId: companyId,
        company: {
          user: {
            email: session.user.email
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Update the note
    // @ts-ignore
    const updatedNote = await prisma.note.update({
      where: {
        id: noteId
      },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.content !== undefined && { content: body.content?.trim() || null }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId, noteId } = await params

    // Verify user owns this company and note exists
    // @ts-ignore
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        companyId: companyId,
        company: {
          user: {
            email: session.user.email
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Delete the note
    // @ts-ignore
    await prisma.note.delete({
      where: {
        id: noteId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 