export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../auth.config';
import { prisma } from '../../../../../../../packages/database/src/index';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const { type } = await request.json();
    
    if (!type || type !== 'LIKE') {
      return NextResponse.json({ error: 'Invalid like type' }, { status: 400 });
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Upsert the like (create or update existing)
    await prisma.like.upsert({
      where: {
        userId_itemId: {
          userId: parseInt(session.user.id),
          itemId: itemId
        }
      },
      update: {
        type: type
      },
      create: {
        userId: parseInt(session.user.id),
        itemId: itemId,
        type: type
      }
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { 
        itemId: itemId,
        type: 'LIKE'
      }
    });

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: likeCount
    });

  } catch (error) {
    console.error('Error managing like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    // Delete the like
    await prisma.like.deleteMany({
      where: {
        userId: parseInt(session.user.id),
        itemId: itemId
      }
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { 
        itemId: itemId,
        type: 'LIKE'
      }
    });

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: likeCount
    });

  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    let userHasLiked = false;
    
    if (session?.user?.id) {
      const userLike = await prisma.like.findUnique({
        where: {
          userId_itemId: {
            userId: parseInt(session.user.id),
            itemId: itemId
          }
        }
      });
      userHasLiked = !!userLike;
    }

    // Get like count
    const likes = await prisma.like.count({
      where: {
        itemId: itemId,
        type: 'LIKE'
      }
    });

    return NextResponse.json({
      likes,
      userHasLiked
    });

  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}