import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId, documentId } = await params

    // Verify user owns this company and document exists
    // @ts-expect-error - Prisma client type recognition issue
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        companyId: companyId,
        company: {
          user: {
            email: session.user.email
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete file from Vercel Blob
    try {
      await del(document.blobUrl)
    } catch (blobError) {
      console.error('Error deleting from Vercel Blob:', blobError)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete document record from database
    // @ts-expect-error - Prisma client type recognition issue
    await prisma.document.delete({
      where: {
        id: documentId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 