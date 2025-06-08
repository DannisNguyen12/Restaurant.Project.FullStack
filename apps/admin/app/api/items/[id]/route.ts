export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../packages/database/src/index';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }
    
    // Fetch the specific item with detailed information
    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        name: true,
        fullDescription: true,
        price: true,
        image: true,
        ingredients: true, // Added
        servingTips: true, // Added
        recommendations: true, // Added
        category: {
          select: {
            id: true,
            name: true
          }
        },
        orderItems: {
          select: {
            quantity: true
          }
        },
        likes: {
          select: {
            id: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
    });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.item.delete({
      where: { id: itemId }
    });

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id);
    
    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      fullDescription, 
      price, 
      image, 
      ingredients, 
      servingTips, 
      recommendations, 
      categoryId 
    } = body;

    // Validate required fields
    if (!name || !fullDescription || price === undefined) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      name: string;
      fullDescription: string;
      price: number;
      image?: string | null;
      ingredients?: string;
      servingTips?: string;
      recommendations?: string;
      categoryId?: number | null;
    } = {
      name: name.trim(),
      fullDescription: fullDescription.trim(),
      price: parseFloat(price.toString()),
    };

    if (image !== undefined) {
      updateData.image = image;
    }

    if (ingredients !== undefined) {
      updateData.ingredients = Array.isArray(ingredients) 
        ? JSON.stringify(ingredients) 
        : ingredients;
    }

    if (servingTips !== undefined) {
      updateData.servingTips = Array.isArray(servingTips) 
        ? JSON.stringify(servingTips) 
        : servingTips;
    }

    if (recommendations !== undefined) {
      updateData.recommendations = Array.isArray(recommendations) 
        ? JSON.stringify(recommendations) 
        : recommendations;
    }

    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateData.categoryId = null;
      } else {
        const categoryExists = await prisma.category.findUnique({
          where: { id: parseInt(categoryId) }
        });
        
        if (!categoryExists) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 400 }
          );
        }
        
        updateData.categoryId = parseInt(categoryId);
      }
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}