import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth.js';
import { sendOtpEmail } from '../lib/email.js';
import { notifyTelegram, newUserTelegramMessage } from '../lib/telegram.js';

const router = Router();

function publicUser(user: any) {
  const { password, otpCode, otpExpiresAt, ...rest } = user;
  return rest;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// --- Sign up: creates an unverified account and emails a 6-digit code ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, whatsapp, homeChurch, language } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!whatsapp) {
      return res.status(400).json({ error: 'A WhatsApp number is required' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing && existing.emailVerified) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const lang = language === 'fr' ? 'fr' : 'en';

    // Self-signup is always Student — Counselor/Admin accounts are created by an Admin (see /create-staff).
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { name, password: passwordHash, whatsapp, homeChurch: homeChurch ?? '', language: lang, otpCode, otpExpiresAt },
        })
      : await prisma.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            password: passwordHash,
            whatsapp,
            homeChurch: homeChurch ?? '',
            language: lang,
            role: 'Student',
            otpCode,
            otpExpiresAt,
          },
        });

    await sendOtpEmail(user.email, user.name, otpCode);

    res.status(201).json({ pendingEmail: user.email });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// --- Verify the code, activate the account, and log the user in ---
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body ?? {};
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ error: 'No pending verification for this email' });
    }
    if (user.otpCode !== code) {
      return res.status(400).json({ error: 'Incorrect code' });
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'This code has expired. Request a new one.' });
    }

    const verified = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
    });

    // Fire-and-forget — a Telegram hiccup should never block the user's signup.
    notifyTelegram(
      newUserTelegramMessage({ name: verified.name, email: verified.email, whatsapp: verified.whatsapp, homeChurch: verified.homeChurch })
    );

    const token = signToken({ userId: verified.id });
    res.json({ token, user: publicUser(verified) });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Could not verify code' });
  }
});

// --- Resend a fresh code ---
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'No account found for that email' });
    if (user.emailVerified) return res.status(400).json({ error: 'This account is already verified' });

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { otpCode, otpExpiresAt } });
    await sendOtpEmail(user.email, user.name, otpCode);

    res.json({ ok: true });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Could not resend code' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email first', pendingEmail: user.email });
    }

    const token = signToken({ userId: user.id });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Could not log in' });
  }
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

// --- Admin-only: create a Counselor or Admin account directly (no OTP needed — an admin vouches for them) ---
router.post('/create-staff', requireAuth, requireRole('Admin'), async (req: AuthedRequest, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }
    if (role !== 'Counselor' && role !== 'Admin') {
      return res.status(400).json({ error: 'Role must be Counselor or Admin' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
        emailVerified: true, // admin-created accounts skip OTP
      },
    });

    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    console.error('Create staff error:', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// --- Admin-only: list all staff (Counselor + Admin) accounts ---
router.get('/staff', requireAuth, requireRole('Admin'), async (_req, res) => {
  const staff = await prisma.user.findMany({
    where: { role: { in: ['Counselor', 'Admin'] } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ staff: staff.map(publicUser) });
});

export default router;
