import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../auth.config';
import { prisma } from '../../../../../../../packages/database/src/index';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = parseInt(params.id);
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
    const like = await prisma.like.upsert({
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

    return NextResponse.json({ 
      success: true, 
      like: {
        id: like.id,
        type: like.type,
        userId: like.userId,
        itemId: like.itemId
      }
    });

  } catch (error) {
    console.error('Error managing like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = parseInt(params.id);
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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error removing like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    let userLike = null;
    
    if (session?.user?.id) {
      userLike = await prisma.like.findUnique({
        where: {
          userId_itemId: {
            userId: parseInt(session.user.id),
            itemId: itemId
          }
        }
      });
    }

    // Get like counts
    const likeCounts = await prisma.like.groupBy({
      by: ['type'],
      where: {
        itemId: itemId
      },
      _count: {
        type: true
      }
    });

    const likes = likeCounts.find(count => count.type === 'LIKE')?._count.type || 0;

    return NextResponse.json({
      userLike: userLike ? userLike.type : null,
      counts: {
        likes,
        total: likes
      }
    });

  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}