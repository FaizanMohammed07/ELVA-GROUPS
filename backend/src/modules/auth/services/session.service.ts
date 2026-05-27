import { RedisCache } from '../../../config/cache';
import { Request } from 'express';
import { generateDeviceFingerprint } from '../../../utils/crypto';

const sessionCache = new RedisCache('session', 7 * 24 * 3600);

export interface SessionData {
  sessionId: string;
  userId: string;
  deviceFingerprint: string;
  userAgent: string;
  ip: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
}

export class SessionService {
  async createSession(
    userId: string,
    sessionId: string,
    fingerprint: string,
    req: Request,
  ): Promise<void> {
    const session: SessionData = {
      sessionId,
      userId,
      deviceFingerprint: fingerprint,
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || '',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    await sessionCache.set(`${userId}:${sessionId}`, session, 7 * 24 * 3600);

    // Add to user sessions index
    const sessionsKey = `${userId}:sessions`;
    const existing = await sessionCache.get<string[]>(sessionsKey) || [];
    existing.push(sessionId);
    await sessionCache.set(sessionsKey, existing, 7 * 24 * 3600);
  }

  async getSession(userId: string, sessionId: string): Promise<SessionData | null> {
    return sessionCache.get(`${userId}:${sessionId}`);
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await sessionCache.get<string[]>(`${userId}:sessions`) || [];
    const sessions = await Promise.all(
      sessionIds.map((id) => sessionCache.get<SessionData>(`${userId}:${id}`)),
    );
    return sessions.filter(Boolean) as SessionData[];
  }

  async rotateSession(
    userId: string,
    oldSessionId: string,
    newSessionId: string,
    req: Request,
  ): Promise<void> {
    await this.revokeSession(userId, oldSessionId);
    const fingerprint = generateDeviceFingerprint(
      req.headers['user-agent'] || '',
      req.ip || '',
      req.headers['accept-language'] || '',
    );
    await this.createSession(userId, newSessionId, fingerprint, req);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await sessionCache.del(`${userId}:${sessionId}`);
    const sessionsKey = `${userId}:sessions`;
    const existing = await sessionCache.get<string[]>(sessionsKey) || [];
    const updated = existing.filter((id) => id !== sessionId);
    await sessionCache.set(sessionsKey, updated, 7 * 24 * 3600);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const sessionIds = await sessionCache.get<string[]>(`${userId}:sessions`) || [];
    await Promise.all(sessionIds.map((id) => sessionCache.del(`${userId}:${id}`)));
    await sessionCache.del(`${userId}:sessions`);
  }

  async updateLastActive(userId: string, sessionId: string): Promise<void> {
    const session = await this.getSession(userId, sessionId);
    if (session) {
      session.lastActiveAt = new Date().toISOString();
      await sessionCache.set(`${userId}:${sessionId}`, session, 7 * 24 * 3600);
    }
  }
}
