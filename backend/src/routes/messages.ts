import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// Helper function to validate request
const validateRequest = (req: express.Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
};

// POST /api/messages
router.post('/', [
  authMiddleware,
  body('recipientId').isUUID(),
  body('subject').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('type').optional().isIn(['DIRECT', 'FEEDBACK_REPLY', 'WORKOUT_QUESTION', 'GENERAL']),
  body('parentId').optional().isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { recipientId, subject, content, type = 'DIRECT', parentId } = req.body;

    // Check if recipient exists and allows messages
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: {
            allowMessages: true,
          }
        }
      }
    });

    if (!recipient) {
      throw new NotFoundError('Destinatario no encontrado');
    }

    if (!recipient.profile?.allowMessages) {
      throw new ForbiddenError('El destinatario no permite recibir mensajes');
    }

    // Check if users have a relationship (coach-athlete or vice versa)
    const relationship = await prisma.coachAthlete.findFirst({
      where: {
        OR: [
          { coachId: req.user.id, athleteId: recipientId, status: 'ACTIVE' },
          { coachId: recipientId, athleteId: req.user.id, status: 'ACTIVE' }
        ]
      }
    });

    if (!relationship) {
      throw new ForbiddenError('Solo puedes enviar mensajes a usuarios con los que tienes una relación activa');
    }

    // If it's a reply, verify parent message exists and user has access
    if (parentId) {
      const parentMessage = await prisma.message.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          senderId: true,
          recipientId: true,
        }
      });

      if (!parentMessage) {
        throw new NotFoundError('Mensaje padre no encontrado');
      }

      const canReply = parentMessage.senderId === req.user.id || 
                      parentMessage.recipientId === req.user.id;

      if (!canReply) {
        throw new ForbiddenError('No tienes permisos para responder a este mensaje');
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        recipientId,
        subject,
        content,
        type,
        parentId,
      },
      select: {
        id: true,
        subject: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'Nuevo mensaje',
        message: `${req.user.firstName} ${req.user.lastName} te ha enviado un mensaje${subject ? `: ${subject}` : ''}`,
        data: {
          messageId: message.id,
          senderId: req.user.id,
          type,
        }
      }
    });

    logger.info('Message sent', {
      messageId: message.id,
      senderId: req.user.id,
      recipientId,
      type,
    });

    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      data: message,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/messages
router.get('/', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['sent', 'received', 'all']),
  query('unreadOnly').optional().isBoolean(),
  query('search').optional().isString(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string || 'all';
    const unreadOnly = req.query.unreadOnly === 'true';
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {
      AND: []
    };

    // Filter by message type (sent/received/all)
    if (type === 'sent') {
      where.AND.push({ senderId: req.user.id });
    } else if (type === 'received') {
      where.AND.push({ recipientId: req.user.id });
    } else {
      where.AND.push({
        OR: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      });
    }

    // Filter unread messages
    if (unreadOnly) {
      where.AND.push({
        recipientId: req.user.id,
        isRead: false,
      });
    }

    // Search in subject and content
    if (search) {
      where.AND.push({
        OR: [
          { subject: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    // Only show top-level messages (not replies) in the main list
    where.AND.push({ parentId: null });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          subject: true,
          content: true,
          type: true,
          isRead: true,
          createdAt: true,
          senderId: true,
          recipientId: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          _count: {
            select: {
              replies: true,
            }
          }
        }
      }),
      prisma.message.count({ where })
    ]);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/messages/:messageId
router.get('/:messageId', [
  authMiddleware,
  param('messageId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        subject: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        senderId: true,
        recipientId: true,
        parentId: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        parent: {
          select: {
            id: true,
            subject: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!message) {
      throw new NotFoundError('Mensaje no encontrado');
    }

    // Check if user has access to this message
    const hasAccess = message.senderId === req.user.id || 
                     message.recipientId === req.user.id;

    if (!hasAccess) {
      throw new ForbiddenError('No tienes permisos para ver este mensaje');
    }

    // Mark message as read if user is the recipient
    if (message.recipientId === req.user.id && !message.isRead) {
      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true }
      });
      message.isRead = true;
    }

    res.json({ message });

  } catch (error) {
    throw error;
  }
});

// POST /api/messages/:messageId/reply
router.post('/:messageId/reply', [
  authMiddleware,
  param('messageId').isUUID(),
  body('content').trim().isLength({ min: 1, max: 2000 }),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { messageId } = req.params;
    const { content } = req.body;

    // Get original message
    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        subject: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!originalMessage) {
      throw new NotFoundError('Mensaje original no encontrado');
    }

    // Check if user has access to reply
    const canReply = originalMessage.senderId === req.user.id || 
                    originalMessage.recipientId === req.user.id;

    if (!canReply) {
      throw new ForbiddenError('No tienes permisos para responder a este mensaje');
    }

    // Determine recipient (the other person in the conversation)
    const recipientId = originalMessage.senderId === req.user.id 
      ? originalMessage.recipientId 
      : originalMessage.senderId;

    const reply = await prisma.message.create({
      data: {
        senderId: req.user.id,
        recipientId,
        subject: originalMessage.subject?.startsWith('Re: ') 
          ? originalMessage.subject 
          : `Re: ${originalMessage.subject || 'Sin asunto'}`,
        content,
        type: 'DIRECT',
        parentId: messageId,
      },
      select: {
        id: true,
        subject: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'Nueva respuesta',
        message: `${req.user.firstName} ${req.user.lastName} ha respondido a tu mensaje`,
        data: {
          messageId: reply.id,
          originalMessageId: messageId,
          senderId: req.user.id,
        }
      }
    });

    logger.info('Message reply sent', {
      replyId: reply.id,
      originalMessageId: messageId,
      senderId: req.user.id,
      recipientId,
    });

    res.status(201).json({
      message: 'Respuesta enviada exitosamente',
      reply,
    });

  } catch (error) {
    throw error;
  }
});

// PUT /api/messages/:messageId/read
router.put('/:messageId/read', [
  authMiddleware,
  param('messageId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { messageId } = req.params;

    // Check if message exists and user is the recipient
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        recipientId: true,
        isRead: true,
      }
    });

    if (!message) {
      throw new NotFoundError('Mensaje no encontrado');
    }

    if (message.recipientId !== req.user.id) {
      throw new ForbiddenError('Solo el destinatario puede marcar el mensaje como leído');
    }

    if (message.isRead) {
      return res.json({
        message: 'El mensaje ya estaba marcado como leído',
      });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    logger.info('Message marked as read', {
      messageId,
      userId: req.user.id,
    });

    res.json({
      message: 'Mensaje marcado como leído',
    });

  } catch (error) {
    throw error;
  }
});

// DELETE /api/messages/:messageId
router.delete('/:messageId', [
  authMiddleware,
  param('messageId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { messageId } = req.params;

    // Check if message exists and user is the sender
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        senderId: true,
        _count: {
          select: {
            replies: true,
          }
        }
      }
    });

    if (!message) {
      throw new NotFoundError('Mensaje no encontrado');
    }

    if (message.senderId !== req.user.id) {
      throw new ForbiddenError('Solo el remitente puede eliminar el mensaje');
    }

    if (message._count.replies > 0) {
      throw new ValidationError('No se puede eliminar un mensaje que tiene respuestas');
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    logger.info('Message deleted', {
      messageId,
      userId: req.user.id,
    });

    res.json({
      message: 'Mensaje eliminado exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/messages/stats/unread
router.get('/stats/unread', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const unreadCount = await prisma.message.count({
      where: {
        recipientId: req.user.id,
        isRead: false,
      }
    });

    res.json({
      unreadCount,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/messages/conversations
router.get('/conversations', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get unique conversations (grouped by the other participant)
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ${req.user.id} THEN m.recipient_id
          ELSE m.sender_id
        END as other_user_id,
        MAX(m.created_at) as last_message_at,
        COUNT(CASE WHEN m.recipient_id = ${req.user.id} AND m.is_read = false THEN 1 END) as unread_count
      FROM messages m
      WHERE m.sender_id = ${req.user.id} OR m.recipient_id = ${req.user.id}
      GROUP BY other_user_id
      ORDER BY last_message_at DESC
      LIMIT ${limit} OFFSET ${skip}
    ` as any[];

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv: any) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: conv.other_user_id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          }
        });

        // Get the last message in this conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: req.user.id, recipientId: conv.other_user_id },
              { senderId: conv.other_user_id, recipientId: req.user.id }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            subject: true,
            content: true,
            createdAt: true,
            senderId: true,
          }
        });

        return {
          otherUser,
          lastMessage,
          unreadCount: parseInt(conv.unread_count),
          lastMessageAt: conv.last_message_at,
        };
      })
    );

    res.json({
      conversations: conversationsWithUsers,
      pagination: {
        page,
        limit,
        hasMore: conversations.length === limit,
      }
    });

  } catch (error) {
    throw error;
  }
});

export default router;