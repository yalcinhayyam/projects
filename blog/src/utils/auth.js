const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(token) {
  if (!token.startsWith('Bearer ')) {
    throw new Error('Invalid token format');
  }

  const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

module.exports = { authenticate };