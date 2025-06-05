import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../../../packages/database/src/index';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

interface OrderRequest {
  items: CartItem[];
  total: number;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardName: string;
  };
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: OrderRequest = await request.json();
    const { items, total, customerInfo } = body;

    // Validate request data
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'Valid total amount is required' },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.email) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Verify that all items exist in the database
    const itemIds = items.map(item => item.id);
    const dbItems = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds
        }
      }
    });

    if (dbItems.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'Some items in the cart no longer exist' },
        { status: 400 }
      );
    }

    // Verify pricing matches
    const pricingErrors: string[] = [];
    items.forEach(cartItem => {
      const dbItem = dbItems.find(item => item.id === cartItem.id);
      if (dbItem && Math.abs(dbItem.price - cartItem.price) > 0.01) {
        pricingErrors.push(`Price mismatch for ${cartItem.name}`);
      }
    });

    if (pricingErrors.length > 0) {
      return NextResponse.json(
        { error: 'Price mismatch detected. Please refresh your cart.' },
        { status: 400 }
      );
    }

    // Calculate and verify total
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = calculatedTotal * 0.1;
    const expectedTotal = calculatedTotal + tax;

    if (Math.abs(expectedTotal - total) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount mismatch' },
        { status: 400 }
      );
    }

    // Create the order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName: customerInfo.fullName,
          total: total,
          status: 'PENDING',
          userId: userId,
        }
      });

      // Create order items
      const orderItemsData = items.map(item => ({
        orderId: newOrder.id,
        itemId: item.id,
        quantity: item.quantity,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData
      });

      // Return the order with items
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              item: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    if (!order) {
      throw new Error('Failed to create order');
    }

    // Log successful order creation
    console.log(`✅ Order created successfully: #${order.id} for user ${session.user.email}`);

    // Return the created order
    return NextResponse.json({
      id: order.id,
      customerName: order.customerName,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(orderItem => ({
        id: orderItem.item.id,
        name: orderItem.item.name,
        price: orderItem.item.price,
        quantity: orderItem.quantity,
        total: orderItem.item.price * orderItem.quantity
      }))
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        items: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}