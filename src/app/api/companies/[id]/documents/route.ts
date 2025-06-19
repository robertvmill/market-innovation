import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params

    // Verify user owns this company
    // @ts-expect-error - Prisma client type recognition issue
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get all documents for this company
    // @ts-expect-error - Prisma client type recognition issue
    const documents = await prisma.document.findMany({
      where: {
        companyId: companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Verify user owns this company
    // @ts-expect-error - Prisma client type recognition issue
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Save document metadata to database
    // @ts-expect-error - Prisma client type recognition issue
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        filesize: file.size,
        mimetype: file.type,
        blobUrl: blob.url,
        companyId: companyId
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 